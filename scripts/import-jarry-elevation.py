#!/usr/bin/env python3
"""Acquire and reproduce Jarry's measured elevation and clipped terrain meshes.

Tooling only: Shapely 2.2.0, numpy 2.5.4, Pillow 12.3.0 (no app dependency).

  python import-jarry-elevation.py acquire --osm jarry-osm.json --source-dir /tmp/jarry-relief-source
  python import-jarry-elevation.py build --osm jarry-osm.json --source-dir /tmp/jarry-relief-source --output-dir app/lib/macomisyon/data

Acquisition is explicit and separate. `build` has NO network access, verifies
all cached SHA256, rejects missing/invalid data, and never repairs polygons.
IGN is primary. Explicitly cached Terrain Tiles z12 supply invalid IGN samples;
no clamp, smoothing, vertical exaggeration, or invented sea heights are applied.

Interpolation is piecewise affine on NW--SE grid diagonals, NOT bilinear:
 u >= v: (1-u)*NW + (u-v)*NE + v*SE
 u <  v: (1-v)*NW + (v-u)*SW + u*SE
where u=(x-cellMinX)/stepX, v=(z-cellMinZ)/stepZ. Rows run north to south.
Meshes use this same split. Height quantization contributes at most 0.005 m.
"""

import argparse
import hashlib
import io
import json
import math
import statistics
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

IGN_URL = 'https://data.geopf.fr/altimetrie/1.0/calcul/alti/rest/elevation.json'
RESOURCE_URL = 'https://data.geopf.fr/altimetrie/resources/ign_rge_alti_wld'
DOC_URL = 'https://cartes.gouv.fr/aide/fr/guides-utilisateur/utiliser-les-services-de-la-geoplateforme/calcul-altimetrique/'
TERRARIUM_URL = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'
# Regional sanity bounds, not clipping: outliers are rejected and provenance
# records which independent source replaced them. Deep bathymetry is not terrain.
VALID_MIN, VALID_MAX = -10.0, 150.0
LAYERS = ('land', 'industrial', 'vegetation', 'water')


def compact(value):
    return json.dumps(value, ensure_ascii=False, separators=(',', ':'), allow_nan=False).encode('utf-8')


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def read_json(path):
    return json.loads(Path(path).read_text(encoding='utf-8'))


def grid_for(meta, spacing):
    minx = math.floor(-meta['widthMetres'] / 2 / spacing) * spacing
    minz = math.floor(-meta['depthMetres'] / 2 / spacing) * spacing
    return dict(columns=math.ceil((meta['widthMetres'] / 2 - minx) / spacing) + 1,
                rows=math.ceil((meta['depthMetres'] / 2 - minz) / spacing) + 1,
                minX=minx, minZ=minz, stepX=spacing, stepZ=spacing)


def georeference(meta):
    return {k: meta[k] for k in ('bbox', 'origin', 'projection', 'widthMetres', 'depthMetres')}


def grid_points(grid, meta):
    # Invert the EXISTING local projection exactly; do not mix with UTM metres.
    for r in range(grid['rows']):
        for c in range(grid['columns']):
            x, z = grid['minX'] + c * grid['stepX'], grid['minZ'] + r * grid['stepZ']
            yield (round(meta['origin']['lon'] + x / meta['projection']['xMetresPerDegree'], 11),
                   round(meta['origin']['lat'] + z / meta['projection']['zMetresPerDegree'], 11))


def download(url, payload=None):
    request = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'} if payload else {})
    for attempt in range(5):
        try:
            with urllib.request.urlopen(request, timeout=90) as response:
                return response.read(), dict(response.headers.items())
        except urllib.error.HTTPError as error:
            if attempt == 4 or error.code not in (429, 500, 502, 503, 504):
                raise
            time.sleep(float(error.headers.get('Retry-After', 5 * (attempt + 1))))
        except (TimeoutError, urllib.error.URLError):
            if attempt == 4:
                raise
            time.sleep(5 * (attempt + 1))
    raise RuntimeError('Download exhausted retries')


def tile_pixel(lon, lat, zoom=12):
    scale = 256 * 2 ** zoom
    return ((lon + 180) / 360 * scale - .5,
            (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * scale - .5)


def acquire(args):
    source = args.source_dir
    source.mkdir(parents=True, exist_ok=True)
    osm = read_json(args.osm)
    grid = grid_for(osm['meta'], args.spacing)
    manifest_path = source / 'manifest.json'
    manifest = read_json(manifest_path) if manifest_path.exists() else {
        'formatVersion': 1, 'provider': 'ign_rge_alti_wld', 'sourceUrl': IGN_URL,
        'resourceUrl': RESOURCE_URL, 'collectedAt': datetime.now(timezone.utc).isoformat(),
        'grid': grid, 'georeference': georeference(osm['meta']), 'files': {}, 'batches': []}
    if manifest['grid'] != grid or manifest['georeference'] != georeference(osm['meta']):
        raise ValueError('Existing cache uses a different grid/projection')
    manifest['complete'] = False

    def cached(name, url, payload=None):
        path = source / name
        if path.exists():
            raw = path.read_bytes()
            if name in manifest['files'] and sha(raw) != manifest['files'][name]:
                raise ValueError(f'Cache checksum mismatch: {name}')
            headers = {}
        else:
            raw, headers = download(url, payload)
            path.write_bytes(raw)
        manifest['files'][name] = sha(raw)
        return raw, headers

    cached('resource.json', RESOURCE_URL)
    points = list(grid_points(grid, osm['meta']))
    manifest['batches'] = []
    for start in range(0, len(points), 2000):
        batch = points[start:start + 2000]
        request_name, response_name = f'request-{start:05d}.json', f'response-{start:05d}.json'
        payload = compact(dict(lon='|'.join(str(x) for x, _ in batch),
                               lat='|'.join(str(z) for _, z in batch), resource='ign_rge_alti_wld',
                               delimiter='|', measures='true', zonly='false', indent='false'))
        # Keep an existing, equivalent request byte-for-byte when resuming.
        if (source / request_name).exists():
            existing = (source / request_name).read_bytes()
            if json.loads(existing) != json.loads(payload):
                raise ValueError(f'Request differs on cache resume: {request_name}')
            payload = existing
        (source / request_name).write_bytes(payload)
        manifest['files'][request_name] = sha(payload)
        raw, _ = cached(response_name, IGN_URL, payload)
        if len(json.loads(raw).get('elevations', [])) != len(batch):
            raise ValueError(f'Incomplete response: {response_name}')
        manifest['batches'].append(dict(start=start, count=len(batch), request=request_name,
                                       response=response_name, method='POST', url=IGN_URL))
        manifest_path.write_bytes(compact(manifest))
        print(f'IGN {start + len(batch)}/{len(points)}', file=sys.stderr)
        time.sleep(.25)  # Below the official 5 requests/second/IP limit.

    # Explicit secondary source, fetched at z12, NOT the known-corrupted z15
    # raster at Jarry. Source attribution/datum remain separate from IGN.
    tiles = set()
    for lon, lat in points:
        px, py = tile_pixel(lon, lat)
        for x in (math.floor(px), math.floor(px) + 1):
            for y in (math.floor(py), math.floor(py) + 1):
                tiles.add((x // 256, y // 256))
    previous_tiles = {t['file']: t for t in manifest.get('fallback', {}).get('tiles', [])}
    manifest['fallback'] = dict(provider='Terrain Tiles / Mapzen / AWS Open Data', zoom=12, tiles=[])
    for x, y in sorted(tiles):
        name = f'terrarium-12-{x}-{y}.png'
        url = TERRARIUM_URL.format(z=12, x=x, y=y)
        _, headers = cached(name, url)
        if not headers:
            headers = previous_tiles.get(name, {}).get('headers', {})
        manifest['fallback']['tiles'].append(dict(file=name, x=x, y=y, url=url, headers=headers))
    manifest['complete'] = True
    manifest_path.write_bytes(compact(manifest))
    print(f'Cached explicit sources in {source}', file=sys.stderr)


def valid_height(height, minimum=VALID_MIN):
    return isinstance(height, (int, float)) and math.isfinite(height) and minimum <= height <= VALID_MAX


def height_at(grid, heights, x, z):
    gx = (x - grid['minX']) / grid['stepX']
    gz = (z - grid['minZ']) / grid['stepZ']
    if not (0 <= gx <= grid['columns'] - 1 and 0 <= gz <= grid['rows'] - 1):
        raise ValueError(f'Outside elevation coverage: {x}, {z}')
    col = min(math.floor(gx), grid['columns'] - 2)
    row = min(math.floor(gz), grid['rows'] - 2)
    u, v = gx - col, gz - row
    nw = row * grid['columns'] + col
    a, b, c, d = heights[nw], heights[nw + 1], heights[nw + grid['columns']], heights[nw + grid['columns'] + 1]
    return (1 - u) * a + (u - v) * b + v * d if u >= v else (1 - v) * a + (v - u) * c + u * d


def read_elevation(source, osm):
    from PIL import Image
    manifest = read_json(source / 'manifest.json')
    if not manifest.get('complete') or manifest['provider'] != 'ign_rge_alti_wld':
        raise ValueError('Incomplete source manifest or unsupported IGN resource')
    if manifest['georeference'] != georeference(osm['meta']):
        raise ValueError('OSM projection/bounds differ from acquisition')
    for name, digest in manifest['files'].items():
        if sha((source / name).read_bytes()) != digest:
            raise ValueError(f'SHA256 mismatch for {name}')
    grid = manifest['grid']
    points = list(grid_points(grid, osm['meta']))
    heights = [None] * len(points)
    fallbacks, rejected = [], {'nodata': 0, 'outsideRegionalSanityBounds': 0}
    tiles = {}
    for tile in manifest.get('fallback', {}).get('tiles', []):
        image = Image.open(io.BytesIO((source / tile['file']).read_bytes()))
        if image.size != (256, 256) or image.mode not in ('RGB', 'RGBA'):
            raise ValueError('Invalid Terrarium PNG')
        tiles[tile['x'], tile['y']] = image.convert('RGB')

    def terrarium(lon, lat):
        px, py = tile_pixel(lon, lat)
        ix, iy = math.floor(px), math.floor(py)
        u, v = px - ix, py - iy
        result = 0.
        for dx, dy, weight in ((0, 0, (1-u)*(1-v)), (1, 0, u*(1-v)), (0, 1, (1-u)*v), (1, 1, u*v)):
            tx, ty = ix + dx, iy + dy
            tile = tiles.get((tx // 256, ty // 256))
            if tile is None:
                raise ValueError('Missing explicit fallback tile; run acquire first')
            r, g, b = tile.getpixel((tx % 256, ty % 256))
            height = r * 256 + g + b / 256 - 32768
            if not valid_height(height, minimum=-100):
                raise ValueError(f'Invalid secondary source pixel: {height} at {lon}, {lat}; no clamp permitted')
            result += height * weight
        return round(result, 2)

    for batch in manifest['batches']:
        request = read_json(source / batch['request'])
        if request['resource'] != 'ign_rge_alti_wld':
            raise ValueError('Unexpected IGN resource')
        response = read_json(source / batch['response'])['elevations']
        if len(response) != batch['count']:
            raise ValueError('Missing IGN samples')
        for offset, entry in enumerate(response):
            index = batch['start'] + offset
            lon, lat = points[index]
            if heights[index] is not None or abs(entry['lon']-lon) > 1e-8 or abs(entry['lat']-lat) > 1e-8:
                raise ValueError('Duplicate, reordered, or mismatched IGN coordinates')
            height = entry['z']
            if valid_height(height):
                if not any(m.get('source_name') == 'RGE Alti IGN' and m.get('z') == height for m in entry.get('measures', [])):
                    raise ValueError('IGN height has inconsistent source metadata')
                heights[index] = round(height, 2)
            else:
                if not isinstance(height, (int, float)) or not math.isfinite(height):
                    raise ValueError('Non-numeric IGN altitude')
                rejected['nodata' if abs(height + 99999) < .02 else 'outsideRegionalSanityBounds'] += 1
                heights[index] = terrarium(lon, lat)
                fallbacks.append(index)
    if any(h is None or not valid_height(h, minimum=-100) for h in heights):
        raise ValueError('Incomplete or invalid height grid')
    return manifest, grid, heights, fallbacks, rejected


def polygons(geometry):
    if geometry.is_empty:
        return []
    if geometry.geom_type == 'Polygon':
        return [geometry]
    if geometry.geom_type in ('MultiPolygon', 'GeometryCollection'):
        return [polygon for part in geometry.geoms for polygon in polygons(part)]
    return []


def build(args):
    import numpy as np
    import shapely
    from shapely.geometry import Polygon, Point, LineString
    from shapely.ops import unary_union
    from shapely.strtree import STRtree

    osm = read_json(args.osm)
    manifest, grid, heights, fallback_indices, rejected = read_elevation(args.source_dir, osm)
    shapes = {}
    for layer in LAYERS:
        shapes[layer] = []
        for item in osm[layer]:
            polygon = Polygon(item['outer'], item['holes'])
            if not polygon.is_valid or polygon.is_empty:
                raise ValueError(f'{item["id"]}: invalid source polygon: {shapely.is_valid_reason(polygon)}')
            shapes[layer].append(polygon)
    land = unary_union(shapes['land'])
    water = unary_union(shapes['water'])
    # Clip the dry layers to actual land, then cut out mapped inland waters.
    dry_land = land.difference(water)
    support = []
    for row in range(grid['rows'] - 1):
        z = grid['minZ'] + row * grid['stepZ']
        for col in range(grid['columns'] - 1):
            x = grid['minX'] + col * grid['stepX']
            s, t = grid['stepX'], grid['stepZ']
            support.extend((Polygon([(x,z),(x+s,z),(x+s,z+t)]), Polygon([(x,z),(x+s,z+t),(x,z+t)])))
    tree = STRtree(support)
    support_array = np.array(support, dtype=object)
    diagnostics = {}
    layers = {k: [] for k in LAYERS}
    maximum_contour_error = 0.

    def quantize(x, z):
        # At NW--SE intersections, quantize ONE parameter to keep the point on
        # the diagonal; independent round(x)/round(z) can cross the support.
        gx, gz = (x-grid['minX'])/grid['stepX'], (z-grid['minZ'])/grid['stepZ']
        if abs((gx-gz)-round(gx-gz)) < 1e-9:
            diagonal = round(gx-gz)
            x = round(x, 2)
            z = x-grid['minX']+grid['minZ']-diagonal*grid['stepX']
        return round(x, 2), round(z, 2)

    for layer in LAYERS:
        for item, original in zip(osm[layer], shapes[layer]):
            geometry = original if layer == 'water' else original.intersection(dry_land)
            if geometry.is_empty:
                raise ValueError(f'{item["id"]}: entirely outside dry land; inspect source')
            if not geometry.is_valid:
                raise ValueError(f'{item["id"]}: invalid dry-land clipping')
            positions, indices, vertices, triangles_2d = [], [], {}, []
            flat_height = None
            boundary_heights = []
            if layer == 'water':
                # Constant display surface, not a surveyed hydrological level.
                for ring in [original.exterior, *original.interiors]:
                    line = LineString(ring.coords)
                    n = max(1, math.ceil(line.length / grid['stepX']))
                    for i in range(n):
                        p = line.interpolate(i / n, normalized=True)
                        boundary_heights.append(height_at(grid, heights, p.x, p.y))
                flat_height = round(statistics.median(boundary_heights), 2)
                fragments = polygons(geometry)
            else:
                candidates = tree.query(geometry, predicate='intersects')
                cuts = shapely.intersection(support_array[candidates], geometry)
                fragments = [p for cut in cuts for p in polygons(cut)]
            for fragment in fragments:
                if fragment.area <= 0:
                    raise ValueError('Zero-area polygon fragment')
                if layer == 'water':
                    quantized = fragment
                else:
                    quantized = Polygon([quantize(x,z) for x,z in fragment.exterior.coords],
                                        [[quantize(x,z) for x,z in ring.coords] for ring in fragment.interiors])
                if not quantized.is_valid or quantized.is_empty or quantized.area == 0:
                    raise ValueError(f'{item["id"]}: centimetre quantization destroys a fragment; retain higher precision')
                tri_geoms = [quantized] if not quantized.interiors and len(quantized.exterior.coords)==4 else shapely.constrained_delaunay_triangles(quantized).geoms
                for tri in tri_geoms:
                    coords = [(round(x,2),round(z,2)) for x,z in list(tri.exterior.coords)[:3]]
                    cross = ((coords[1][0]-coords[0][0])*(coords[2][1]-coords[0][1]) -
                             (coords[1][1]-coords[0][1])*(coords[2][0]-coords[0][0]))
                    if abs(cross) < 1e-10:
                        raise ValueError(f'{item["id"]}: degenerate serialized triangle')
                    if cross > 0:  # +Y normals in east-X / south-Z coordinates.
                        coords[1], coords[2] = coords[2], coords[1]
                    tri_indices = []
                    for x, z in coords:
                        key = (x,z)
                        if key not in vertices:
                            vertices[key] = len(positions)//3
                            h = flat_height if flat_height is not None else round(height_at(grid, heights, x, z), 2)
                            positions.extend((x, h, z))
                        tri_indices.append(vertices[key])
                    indices.extend(tri_indices)
                    triangles_2d.append(Polygon(coords))
            union = shapely.union_all(triangles_2d)
            max_error = geometry.boundary.hausdorff_distance(union.boundary)
            if max_error > .0072:
                raise ValueError(f'{item["id"]}: contour moved {max_error}m (> rounding tolerance)')
            original_parts, final_parts = polygons(geometry), polygons(union)
            if len(original_parts) != len(final_parts) or sum(len(p.interiors) for p in original_parts) != sum(len(p.interiors) for p in final_parts):
                raise ValueError(f'{item["id"]}: lost component or hole')
            overlap = sum(t.area for t in triangles_2d) - union.area
            if abs(overlap) > max(1e-6, union.area*1e-10):
                raise ValueError(f'{item["id"]}: overlapping triangles ({overlap}m2)')
            maximum_contour_error = max(maximum_contour_error, max_error)
            entry = dict(id=item['id'], positions=positions, indices=indices)
            if 'kind' in item:
                entry['kind'] = item['kind']
            if flat_height is not None:
                entry['levelMetres'] = flat_height
                entry['boundaryHeightRangeMetres'] = [round(min(boundary_heights),2),round(max(boundary_heights),2)]
            layers[layer].append(entry)
        diagnostics[layer] = dict(features=len(layers[layer]), vertices=sum(len(p['positions'])//3 for p in layers[layer]),
                                  triangles=sum(len(p['indices'])//3 for p in layers[layer]))
        print(f'{layer}: {diagnostics[layer]}', file=sys.stderr)

    fallback_on_land = []
    for i in fallback_indices:
        x = grid['minX'] + (i % grid['columns']) * grid['stepX']
        z = grid['minZ'] + (i // grid['columns']) * grid['stepZ']
        if land.covers(Point(x,z)):
            fallback_on_land.append(i)
    deltas = []
    for i,h in enumerate(heights):
        if i % grid['columns'] < grid['columns']-1:
            deltas.append((abs(h-heights[i+1]),i,i+1))
        if i+grid['columns'] < len(heights):
            deltas.append((abs(h-heights[i+grid['columns']]),i,i+grid['columns']))
    largest = max(deltas)
    if largest[0] > 40:
        raise ValueError(f'Implausible adjacent altitude discontinuity {largest}; no smoothing allowed')
    # The four game sites are scene coordinates in jarry-geography.js, converted
    # using its declared 20 metres/unit. These are checks, never elevation inputs.
    sites = {'memebank':(-1002.2,-59.6),'quilivreou':(237.4,37.6),'shootareas':(41.4,335.6),'zikak':(-1820.8,-145.8)}
    site_heights = {k:dict(x=x,z=z,heightMetres=round(height_at(grid,heights,x,z),2)) for k,(x,z) in sites.items()}
    hashes = {'manifest.json':sha((args.source_dir/'manifest.json').read_bytes()), **manifest['files']}
    geometry_input = {k:osm[k] for k in LAYERS}
    geometry_input['georeference'] = georeference(osm['meta'])
    geometry_sha = sha(compact(geometry_input))
    source_meta = dict(source='IGN RGE ALTI, Géoplateforme ign_rge_alti_wld; explicit Terrain Tiles z12 fallback',
        sourceUrl=IGN_URL, attribution='© IGN; © OpenStreetMap contributors; Terrain Tiles / Mapzen / AWS Open Data (SRTM, GMTED2010)',
        licence='IGN: Licence Ouverte 2.0; OSM: ODbL 1.0; Terrain Tiles: per-source public-domain/open-data attribution',
        bbox=osm['meta']['bbox'], origin=osm['meta']['origin'], projection=osm['meta']['projection'],
        sourceResolutionMetres=None, gridSpacingMetres=grid['stepX'], collectedAt=manifest['collectedAt'],
        sourceSha256=hashes, osmGeometrySha256=geometry_sha, interpolation='piecewise-linear-nw-se',
        verticalExaggeration=1, verticalUnits='metres', verticalDatum='IGN Guadeloupe IGN1988 / GUAD88 (EPSG:5757); fallback vertical datum not proven identical',
        sourceEpoch=None, sourceAccuracyMetres=None,
        notes=['API sampling uses the exact inverse of jarry-osm.json local projection; no partial UTM reprojection.',
               'RGE ALTI is a bare-earth DTM. Buildings, trees and bridge decks are not ground elevation.',
               'API source resolution, survey epoch and point accuracy are not exposed: unknown, not 1m accuracy or centimetre accuracy.',
               '25m grid spacing is output sampling, not native source resolution. No height exaggeration or smoothing.',
               'IGN no-data (-99999, including floating variants) and samples outside the explicit regional sanity interval [-10,150]m are rejected, not clamped.',
               'Rejected IGN samples alone use cached Terrarium z12. This blended source has coarser resolution and an unverified datum offset; it is not equivalent to IGN DTM.',
               'Fallback pixel sanity bounds are [-100,150]m, allowing real shallow bathymetry. Out-of-range pixels abort the import.',
               'Terrain Tiles z15 at Jarry contains extreme negative artifacts and is deliberately not used.',
               'Small negative IGN elevations are preserved. Heights round to 0.01m for storage, not accuracy.',
               'Mesh contours retain the source polygon topology; inserted grid intersections round to 0.01m (maximum displacement sqrt(2)*0.005m).'],
        sourceDocumentationUrl=DOC_URL,
        fallback=dict(source='Terrain Tiles / Mapzen / AWS Open Data', sourceUrl='https://registry.opendata.aws/terrain-tiles/',
                      attributionUrl='https://github.com/tilezen/joerd/blob/master/docs/attribution.md', zoom=12,
                      imagerySources=sorted({v for tile in manifest['fallback']['tiles'] for k,v in tile.get('headers',{}).items()
                                             if k.lower() == 'x-amz-meta-x-imagery-sources'}),
                      pixelSpacingMetresAtOrigin=round(156543.03392804097*math.cos(math.radians(osm['meta']['origin']['lat']))/4096,3),
                      nativeResolutionMetres=None, indices=fallback_indices, samples=len(fallback_indices), landSamples=len(fallback_on_land),
                      landIndices=fallback_on_land, rejectedPrimary=rejected),
        validation=dict(samples=len(heights), minimumMetres=min(heights), maximumMetres=max(heights),
                        maxAdjacentDeltaMetres=round(largest[0],2), maxAdjacentPair=list(largest[1:]), projectSites=site_heights))
    elevation = dict(meta=source_meta, grid=grid, heights=heights)
    surface_meta = dict(source=source_meta['source'],sourceUrl=IGN_URL,attribution=source_meta['attribution'],licence=source_meta['licence'],
                        bbox=source_meta['bbox'],collectedAt=source_meta['collectedAt'],sourceSha256=hashes,osmGeometrySha256=geometry_sha,
                        gridSpacingMetres=grid['stepX'], interpolation='piecewise-linear-nw-se', counts=diagnostics,
                        maxContourDisplacementMetres=round(maximum_contour_error,8),
                        waterLevelMethod='constant per feature: median of MNT samples along all boundary rings at <=25m spacing; not a surveyed water level',
                        notes=['Dry layers intersect OSM land and subtract all mapped OSM water polygons before meshing.',
                               'Original OSM polygon simplification remains unchanged; no further simplification or polygon repair.',
                               'Every dry triangle lies in one 25m grid half-cell (NW-SE diagonal). Heights share the elevation sampler, rounded 0.01m.',
                               'Vertices are shared within each feature. +Y winding. All positions use metres. Renderer owns layer offsets.',
                               'Water polygons keep their OSM footprint and holes; one constant elevation per feature.'])
    args.output_dir.mkdir(parents=True,exist_ok=True)
    for name,value in [('jarry-elevation.json',elevation),('jarry-surfaces.json',dict(meta=surface_meta,layers=layers))]:
        raw = compact(value)
        path=args.output_dir/name
        path.write_bytes(raw)
        print(f'{path}: {len(raw)} bytes; SHA256 {sha(raw)}',file=sys.stderr)
    print(json.dumps(dict(grid=grid,validation=source_meta['validation'],fallbackSamples=len(fallback_indices),
                          fallbackLandSamples=len(fallback_on_land),rejectedPrimary=rejected,counts=diagnostics,
                          maxContourDisplacementMetres=maximum_contour_error),indent=2))


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    commands=parser.add_subparsers(dest='command',required=True)
    for name in ('acquire','build'):
        command=commands.add_parser(name)
        command.add_argument('--osm',required=True,type=Path)
        command.add_argument('--source-dir',required=True,type=Path)
        if name=='acquire':
            command.add_argument('--spacing',type=int,choices=(25,30),default=25)
        else:
            command.add_argument('--output-dir',required=True,type=Path)
    args=parser.parse_args()
    try:
        (acquire if args.command=='acquire' else build)(args)
    except (ValueError,KeyError,FileNotFoundError) as error:
        parser.exit(1,f'ERROR: {error}\n')


if __name__=='__main__':
    main()
