#!/usr/bin/env python3
"""Build the static Jarry geography from explicitly supplied OSM JSON files.

No network access, runtime dependency, app-file copy, or deployment is performed.
See docs/macomisyon-geography-sources.md for the extraction queries and provenance.
"""

import argparse
import collections
import hashlib
import json
import math
from pathlib import Path


def read_source(path):
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data.get("elements"), list):
        raise ValueError(f"{path.name}: missing OSM elements.")
    if data.get("remark"):
        raise ValueError(
            f"{path.name}: incomplete/error Overpass response: {data['remark']}"
        )
    if not data.get("osm3s", {}).get("timestamp_osm_base"):
        raise ValueError(f"{path.name}: missing OSM snapshot timestamp.")
    return data


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--input-dir",
        required=True,
        type=Path,
        help="Directory containing osm-context.json and osm-buildings.json.",
    )
    parser.add_argument(
        "--output-dir",
        required=True,
        type=Path,
        help="Directory receiving jarry-osm.json and validation.json.",
    )
    parser.add_argument(
        "--overview",
        action="store_true",
        help="Also render jarry-topdown.png; requires Pillow.",
    )
    args = parser.parse_args()
    INPUT_DIR = args.input_dir.expanduser().resolve()
    OUTPUT_DIR = args.output_dir.expanduser().resolve()
    for name in ("osm-context.json", "osm-buildings.json"):
        if not (INPUT_DIR / name).is_file():
            parser.error(f"Missing required source: {INPUT_DIR / name}")
    try:
        from shapely.geometry import Polygon, LineString, Point, box
        from shapely.ops import unary_union, polygonize
        from shapely import make_valid
    except ImportError:
        parser.error(
            "Install optional tooling dependency Shapely 2.2.0 in a Python virtualenv."
        )
    if args.overview:
        try:
            from PIL import Image, ImageDraw
        except ImportError:
            parser.error(
                "--overview requires optional tooling dependency Pillow 12.3.0."
            )
    source_hashes = {
        name: hashlib.sha256((INPUT_DIR / name).read_bytes()).hexdigest()
        for name in ("osm-context.json", "osm-buildings.json", "osm-extra.json")
        if (INPUT_DIR / name).is_file()
    }
    BBOX = (-61.590, 16.217, -61.539, 16.263)  # west,south,east,north
    LON0 = round((BBOX[0] + BBOX[2]) / 2, 6)
    LAT0 = round((BBOX[1] + BBOX[3]) / 2, 6)
    R = 6378137
    X_FACTOR = math.pi / 180 * R * math.cos(math.radians(LAT0))
    Y_FACTOR = math.pi / 180 * R

    def xy(lon, lat):
        return ((lon - LON0) * X_FACTOR, (lat - LAT0) * Y_FACTOR)

    def project(g):
        return [xy(p["lon"], p["lat"]) for p in g if "lon" in p]

    CLIP = box(*xy(BBOX[0], BBOX[1]), *xy(BBOX[2], BBOX[3]))

    def polygons(g):
        if g.is_empty:
            return []
        if g.geom_type == "Polygon":
            return [g]
        if g.geom_type in ["MultiPolygon", "GeometryCollection"]:
            return [p for part in g.geoms for p in polygons(part)]
        return []

    def lines(g):
        if g.is_empty:
            return []
        if g.geom_type in ["LineString", "LinearRing"]:
            return [g]
        if g.geom_type in ["MultiLineString", "GeometryCollection"]:
            return [p for part in g.geoms for p in lines(part)]
        return []

    def shape_for(e):
        if e["type"] == "way":
            coords = project(e.get("geometry", []))
            if len(coords) < 4 or coords[0] != coords[-1]:
                return Polygon()
            return make_valid(Polygon(coords))
        if e["type"] == "relation":
            parts = {"outer": [], "inner": []}
            for m in e.get("members", []):
                c = project(m.get("geometry", []))
                if len(c) > 1:
                    parts["inner" if m.get("role") == "inner" else "outer"].append(
                        LineString(c)
                    )
            outer = (
                unary_union(list(polygonize(unary_union(parts["outer"]))))
                if parts["outer"]
                else Polygon()
            )
            inner = (
                unary_union(list(polygonize(unary_union(parts["inner"]))))
                if parts["inner"]
                else Polygon()
            )
            return make_valid(outer.difference(inner))
        return Polygon()

    def ring(c):
        return [[round(x, 2), round(-y, 2)] for x, y in list(c)[:-1]]

    def poly_data(p, **fields):
        return dict(
            fields,
            outer=ring(p.exterior.coords),
            holes=[ring(r.coords) for r in p.interiors],
            area=round(p.area, 1),
        )

    raw = read_source(INPUT_DIR / "osm-context.json")
    es = list(raw["elements"])
    extra = (
        read_source(INPUT_DIR / "osm-extra.json")
        if (INPUT_DIR / "osm-extra.json").exists()
        else {"elements": []}
    )
    es += extra["elements"]
    coasts = []
    segments = []
    for e in es:
        if e.get("tags", {}).get("natural") != "coastline":
            continue
        c = project(e["geometry"])
        coasts.extend(lines(LineString(c).intersection(CLIP)))
        for a, b in zip(c, c[1:]):
            dx = b[0] - a[0]
            dy = b[1] - a[1]
            d = math.hypot(dx, dy)
            if d < 0.5:
                continue
            mx = (a[0] + b[0]) / 2
            my = (a[1] + b[1]) / 2
            if CLIP.contains(Point(mx, my)):
                segments.append(
                    (
                        Point(mx - dy / d, my + dx / d),
                        Point(mx + dy / d, my - dx / d),
                        d,
                    )
                )
    pieces = list(polygonize(unary_union(coasts + [CLIP.boundary])))
    land_polys = []
    classification = []
    for p in pieces:
        left = sum(d for l, r, d in segments if p.contains(l))
        right = sum(d for l, r, d in segments if p.contains(r))
        classification.append(
            {
                "area": round(p.area),
                "landVotesM": round(left),
                "waterVotesM": round(right),
                "land": left > right,
            }
        )
        if left == right or (left > 0 and right > 0):
            raise ValueError(
                "Ambiguous coastline orientation; inspect source before exporting."
            )
        if left > right:
            land_polys.append(p)
    land = unary_union(land_polys)

    water = []
    vegetation = []
    industrial = []
    landuse = []
    for e in es:
        tags = e.get("tags", {})
        natural = tags.get("natural")
        use = tags.get("landuse")
        if natural not in [
            "water",
            "wetland",
            "wood",
            "scrub",
            "grassland",
        ] and use not in [
            "forest",
            "grass",
            "recreation_ground",
            "industrial",
            "commercial",
            "retail",
            "residential",
        ]:
            continue
        g = shape_for(e).intersection(CLIP)
        if g.is_empty:
            continue
        if natural == "water":
            target = water
            kind = tags.get("water", "water")
        elif use in ["industrial", "commercial", "retail", "residential"]:
            target = landuse
            kind = use
        else:
            target = vegetation
            kind = (
                tags.get("wetland", "wetland")
                if natural == "wetland"
                else natural or use
            )
        for i, p in enumerate(polygons(g.simplify(3, preserve_topology=True))):
            if p.area < 40:
                continue
            target.append(
                poly_data(
                    p, id=f"{e['type']}/{e['id']}/{i}", kind=kind, name=tags.get("name")
                )
            )
    industrial = [p for p in landuse if p["kind"] == "industrial"]

    road_types = {
        "motorway",
        "motorway_link",
        "trunk",
        "trunk_link",
        "primary",
        "primary_link",
        "secondary",
        "secondary_link",
        "tertiary",
        "tertiary_link",
        "unclassified",
        "residential",
        "living_street",
        "service",
        "construction",
    }
    roads = []
    for e in es:
        tags = e.get("tags", {})
        kind = tags.get("highway")
        if e["type"] != "way" or kind not in road_types:
            continue
        # Remove private driveways and parking aisles; retain mapped street/service connections.
        if kind == "service" and (
            tags.get("service") in ["parking_aisle", "driveway", "drive-through"]
            or tags.get("access") == "private"
        ):
            continue
        c = project(e.get("geometry", []))
        if len(c) < 2:
            continue
        g = LineString(c).intersection(CLIP)
        for i, line in enumerate(lines(g)):
            if line.length < 8:
                continue
            if kind == "service" and line.length < 45 and not tags.get("name"):
                continue
            roads.append(
                {
                    "id": f"way/{e['id']}/{i}",
                    "name": tags.get("name"),
                    "class": kind,
                    "ref": tags.get("ref"),
                    "bridge": tags.get("bridge") == "yes",
                    "points": [
                        [round(x, 2), round(-y, 2)] for x, y in line.simplify(2).coords
                    ],
                }
            )

    buildings = []
    building_source = None
    if (INPUT_DIR / "osm-buildings.json").exists():
        building_source = read_source(INPUT_DIR / "osm-buildings.json")
        for e in building_source["elements"] + [
            e for e in extra["elements"] if "building" in e.get("tags", {})
        ]:
            tags = e.get("tags", {})
            g = shape_for(e).intersection(CLIP)
            for i, p in enumerate(polygons(g.simplify(1, preserve_topology=True))):
                if p.area < 35 or not land.covers(p.representative_point()):
                    continue
                height = None
                try:
                    if "height" in tags:
                        height = float(tags["height"].replace(" m", ""))
                    elif "building:levels" in tags:
                        height = float(tags["building:levels"]) * 3
                except ValueError:
                    pass
                buildings.append(
                    poly_data(
                        p,
                        id=f"{e['type']}/{e['id']}/{i}",
                        kind=tags.get("building"),
                        name=tags.get("name"),
                        height=height,
                    )
                )
        # Keep 700 largest real footprints + up to 800 spatially distributed smaller ones.
        buildings.sort(key=lambda b: b["area"], reverse=True)
        major = buildings[:700]
        remaining = buildings[700:]
        cells = collections.defaultdict(list)
        for b in remaining:
            x = sum(c[0] for c in b["outer"]) / len(b["outer"])
            z = sum(c[1] for c in b["outer"]) / len(b["outer"])
            cells[(math.floor(x / 250), math.floor(z / 250))].append(b)
        distributed = []
        while cells and len(distributed) < 800:
            for key in sorted(list(cells)):
                distributed.append(cells[key].pop(0))
                if not cells[key]:
                    del cells[key]
                if len(distributed) >= 800:
                    break
        buildings = major + distributed

    labels = []
    for e in es:
        t = e.get("tags", {})
        if e["type"] == "node" and t.get("place") in [
            "hamlet",
            "quarter",
            "neighbourhood",
            "locality",
        ]:
            x, y = xy(e["lon"], e["lat"])
            if CLIP.contains(Point(x, y)):
                labels.append(
                    {
                        "id": f"node/{e['id']}",
                        "name": t.get("name"),
                        "x": round(x, 2),
                        "z": round(-y, 2),
                        "lon": e["lon"],
                        "lat": e["lat"],
                    }
                )

    scene = {
        "meta": {
            "name": "Jarry de La Jaille au port",
            "bbox": {
                "west": BBOX[0],
                "south": BBOX[1],
                "east": BBOX[2],
                "north": BBOX[3],
            },
            "origin": {"lon": LON0, "lat": LAT0},
            "projection": {
                "type": "local_equirectangular",
                "units": "metres",
                "x": "east",
                "z": "south; north is -Z",
                "xMetresPerDegree": X_FACTOR,
                "zMetresPerDegree": -Y_FACTOR,
                "formula": "x=(lon-origin.lon)*xMetresPerDegree; z=(lat-origin.lat)*zMetresPerDegree",
            },
            "widthMetres": round(CLIP.bounds[2] - CLIP.bounds[0], 2),
            "depthMetres": round(CLIP.bounds[3] - CLIP.bounds[1], 2),
            "suggestedMetresPerSceneUnit": 20,
            "source": "OpenStreetMap contributors",
            "attribution": "© OpenStreetMap contributors",
            "licence": "ODbL 1.0",
            "sourceUrl": "https://www.openstreetmap.org/copyright",
            "contextSnapshot": raw["osm3s"]["timestamp_osm_base"],
            "buildingSnapshot": building_source["osm3s"]["timestamp_osm_base"]
            if building_source
            else None,
            "simplificationMetres": {
                "land": 3,
                "vegetation": 3,
                "roads": 2,
                "buildings": 1,
            },
            "notes": [
                "Land polygons reconstructed from directed OSM coastline. Rectangle edges are crop boundaries, never invented shoreline.",
                "Building footprints are real; absent heights remain null and rendering heights must be labelled stylized.",
                "Building selection keeps 700 largest footprints plus 800 spatially distributed smaller footprints.",
                "OSM coverage and dates are source limits, not a cadastral completeness guarantee.",
            ],
        },
        "land": [
            poly_data(p, id=f"land/{i}")
            for i, p in enumerate(polygons(land.simplify(3, preserve_topology=True)))
        ],
        "coastline": [
            {"points": [[round(x, 2), round(-y, 2)] for x, y in l.simplify(2).coords]}
            for l in coasts
        ],
        "water": water,
        "vegetation": vegetation,
        "industrial": industrial,
        "landuse": landuse,
        "roads": roads,
        "buildings": buildings,
        "labels": labels,
    }
    counts = {
        k: len(scene[k])
        for k in [
            "land",
            "coastline",
            "water",
            "vegetation",
            "industrial",
            "landuse",
            "roads",
            "buildings",
            "labels",
        ]
    }
    scene["meta"]["counts"] = counts
    invalid = []
    for layer in ["land", "water", "vegetation", "landuse", "buildings"]:
        for feature in scene[layer]:
            if not Polygon(feature["outer"], feature["holes"]).is_valid:
                invalid.append(feature["id"])
    if invalid:
        raise ValueError(f"Invalid exported polygon(s): {invalid}")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUTPUT_DIR / "jarry-osm.json").write_text(
        json.dumps(scene, ensure_ascii=False, separators=(",", ":"))
    )
    (OUTPUT_DIR / "validation.json").write_text(
        json.dumps(
            {
                "counts": counts,
                "landClassification": classification,
                "invalidPolygons": invalid,
                "sourceSha256": source_hashes,
                "bounds": CLIP.bounds,
                "landAreaM2": land.area,
                "roadClasses": dict(collections.Counter(r["class"] for r in roads)),
                "vegetationClasses": dict(
                    collections.Counter(v["kind"] for v in vegetation)
                ),
            },
            indent=2,
        )
    )

    if args.overview:
        W = 1500
        H = round(
            W * (CLIP.bounds[3] - CLIP.bounds[1]) / (CLIP.bounds[2] - CLIP.bounds[0])
        )
        im = Image.new("RGB", (W, H), "#91c9d0")
        d = ImageDraw.Draw(im)

        def screen(p):
            x, z = p
            return (
                (x - CLIP.bounds[0]) / (CLIP.bounds[2] - CLIP.bounds[0]) * W,
                (z + CLIP.bounds[3]) / (CLIP.bounds[3] - CLIP.bounds[1]) * H,
            )

        def drawpolys(items, color):
            for it in items:
                d.polygon([screen(p) for p in it["outer"]], fill=color, outline=None)
                for h in it["holes"]:
                    d.polygon([screen(p) for p in h], fill="#91c9d0")

        drawpolys(scene["land"], "#e8e1ce")
        drawpolys(landuse, "#d6d0c4")
        drawpolys(water, "#91c9d0")
        for v in vegetation:
            drawpolys([v], "#3a7960" if v["kind"] == "mangrove" else "#9ab48b")
        for r in roads:
            width = 3 if r["class"] in ["trunk", "primary", "secondary"] else 1
            d.line([screen(p) for p in r["points"]], fill="#f9f7eb", width=width)
        drawpolys(buildings, "#9a9188")
        for c in scene["coastline"]:
            d.line([screen(p) for p in c["points"]], fill="#276a74", width=2)
        for l in labels:
            p = screen([l["x"], l["z"]])
            d.text(p, l["name"], fill="#111111", stroke_width=2, stroke_fill="#ffffff")
        d.text(
            (12, 12),
            "Jarry | OSM | Nord en haut | empreintes reelles",
            fill="#101010",
            stroke_width=2,
            stroke_fill="#ffffff",
        )
        for name, lon, lat in [
            ("Rond-point de La Jaille", -61.5708, 16.2547),
            ("Bd Marquisat de Houelbourg", -61.57, 16.241),
            ("Bd de la Pointe de Jarry", -61.554, 16.245),
            ("Port de Jarry", -61.5475, 16.228),
            ("Mangrove de Jarry", -61.5705, 16.2475),
        ]:
            x, y = xy(lon, lat)
            p = screen([x, -y])
            d.text(p, name, fill="#143c3c", stroke_width=3, stroke_fill="#ffffff")
        im.save(OUTPUT_DIR / "jarry-topdown.png")
    print(
        json.dumps(
            {
                "counts": counts,
                "bytes": (OUTPUT_DIR / "jarry-osm.json").stat().st_size,
                "width": scene["meta"]["widthMetres"],
                "depth": scene["meta"]["depthMetres"],
                "classification": classification,
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
