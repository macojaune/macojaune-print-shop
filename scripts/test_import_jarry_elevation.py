"""Numerical and refusal tests; run with the importer's isolated Python venv.

PYTHONDONTWRITEBYTECODE=1 python -m unittest discover -s scripts -p test_import_jarry_elevation.py
"""
import collections
import importlib.util
import json
import math
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('jarry_elevation_import', ROOT / 'scripts/import-jarry-elevation.py')
IMPORTER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(IMPORTER)


class ElevationContractTests(unittest.TestCase):
    def setUp(self):
        self.grid = dict(columns=2, rows=2, minX=0, minZ=0, stepX=25, stepZ=25)

    def test_nonplanar_cell_matches_triangle_not_bilinear(self):
        heights = [0, 0, 0, 10]
        self.assertEqual(IMPORTER.height_at(self.grid, heights, 18.75, 6.25), 2.5)
        self.assertEqual(IMPORTER.height_at(self.grid, heights, 6.25, 18.75), 2.5)
        self.assertEqual(IMPORTER.height_at(self.grid, heights, 12.5, 12.5), 5)

    def test_grid_edges_and_negative_altitudes(self):
        heights = [-.67, 2, -1.2, 4]
        for x, z, h in [(0,0,-.67),(25,0,2),(0,25,-1.2),(25,25,4)]:
            self.assertEqual(IMPORTER.height_at(self.grid, heights, x, z), h)
        self.assertTrue(IMPORTER.valid_height(-.67))
        self.assertFalse(IMPORTER.valid_height(-99999))
        self.assertFalse(IMPORTER.valid_height(-99999.03))
        self.assertFalse(IMPORTER.valid_height(float('nan')))
        self.assertFalse(IMPORTER.valid_height(None))
        with self.assertRaises(ValueError):
            IMPORTER.height_at(self.grid, heights, -0.01, 0)

    def test_inverse_projection_matches_osm(self):
        meta = json.loads((ROOT/'app/lib/macomisyon/data/jarry-osm.json').read_text())['meta']
        grid = IMPORTER.grid_for(meta, 25)
        points = list(IMPORTER.grid_points(grid, meta))
        for index in (0, len(points)//2, len(points)-1):
            lon, lat = points[index]
            x = (lon-meta['origin']['lon'])*meta['projection']['xMetresPerDegree']
            z = (lat-meta['origin']['lat'])*meta['projection']['zMetresPerDegree']
            self.assertAlmostEqual(x,grid['minX']+index%grid['columns']*25,places=5)
            self.assertAlmostEqual(z,grid['minZ']+index//grid['columns']*25,places=5)
        self.assertLessEqual(grid['minX'],-meta['widthMetres']/2)
        self.assertGreaterEqual(grid['minX']+(grid['columns']-1)*25,meta['widthMetres']/2)
        self.assertLessEqual(grid['minZ'],-meta['depthMetres']/2)
        self.assertGreaterEqual(grid['minZ']+(grid['rows']-1)*25,meta['depthMetres']/2)

    def test_offline_cache_refuses_corruption_and_nodata(self):
        meta = dict(bbox={},origin=dict(lon=0,lat=0),projection=dict(xMetresPerDegree=1,zMetresPerDegree=-1),widthMetres=25,depthMetres=25)
        osm = {'meta':meta}
        points = list(IMPORTER.grid_points(self.grid,meta))
        with tempfile.TemporaryDirectory() as directory:
            directory=Path(directory)
            request={'resource':'ign_rge_alti_wld'}
            response={'elevations':[dict(lon=lon,lat=lat,z=3,measures=[dict(z=3,source_name='RGE Alti IGN')]) for lon,lat in points]}
            def save():
                files={}
                for name,value in [('request.json',request),('response.json',response)]:
                    raw=IMPORTER.compact(value);(directory/name).write_bytes(raw);files[name]=IMPORTER.sha(raw)
                manifest=dict(complete=True,provider='ign_rge_alti_wld',grid=self.grid,georeference=IMPORTER.georeference(meta),
                              files=files,batches=[dict(start=0,count=4,request='request.json',response='response.json')])
                (directory/'manifest.json').write_bytes(IMPORTER.compact(manifest))
            save()
            with patch('urllib.request.urlopen',side_effect=AssertionError('Build must remain offline')):
                self.assertEqual(IMPORTER.read_elevation(directory,osm)[2],[3]*4)
                (directory/'response.json').write_text('{}')
                with self.assertRaisesRegex(ValueError,'SHA256'):
                    IMPORTER.read_elevation(directory,osm)
                response['elevations'][0]['z']=-99999
                save()
                with self.assertRaisesRegex(ValueError,'Missing explicit fallback'):
                    IMPORTER.read_elevation(directory,osm)
                response['elevations'][0]['z']=3
                response['elevations'][0]['lon']=.01
                save()
                with self.assertRaisesRegex(ValueError,'coordinates'):
                    IMPORTER.read_elevation(directory,osm)


class GeneratedSurfaceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.elevation=json.loads((ROOT/'app/lib/macomisyon/data/jarry-elevation.json').read_text())
        cls.surfaces=json.loads((ROOT/'app/lib/macomisyon/data/jarry-surfaces.json').read_text())

    def test_grid_source_counts_and_no_invalid_samples(self):
        e=self.elevation;g=e['grid'];fallback=e['meta']['fallback']
        self.assertEqual(len(e['heights']),g['columns']*g['rows'])
        self.assertTrue(all(IMPORTER.valid_height(h,minimum=-100) for h in e['heights']))
        self.assertEqual(len(set(fallback['indices'])),fallback['samples'])
        self.assertTrue(set(fallback['landIndices']).issubset(fallback['indices']))
        self.assertEqual(e['meta']['interpolation'],'piecewise-linear-nw-se')
        self.assertEqual(e['meta']['verticalExaggeration'],1)

    def test_mesh_height_winding_and_cell_confinement(self):
        grid=self.elevation['grid'];heights=self.elevation['heights']
        for layer,features in self.surfaces['layers'].items():
            for feature in features:
                positions=[feature['positions'][i:i+3] for i in range(0,len(feature['positions']),3)]
                self.assertEqual(len(positions),len({(v[0],v[2]) for v in positions}))
                if layer=='water':
                    self.assertEqual(len({v[1] for v in positions}),1)
                edges=collections.Counter()
                for offset in range(0,len(feature['indices']),3):
                    ix=feature['indices'][offset:offset+3]
                    self.assertTrue(all(0<=i<len(positions) for i in ix))
                    a,b,c=[positions[i] for i in ix]
                    cross=(b[0]-a[0])*(c[2]-a[2])-(b[2]-a[2])*(c[0]-a[0])
                    self.assertLess(cross,0)
                    for i,j in zip(ix,ix[1:]+ix[:1]):edges[tuple(sorted((i,j)))]+=1
                    if layer=='water':continue
                    for x,y,z in (a,b,c):
                        self.assertLessEqual(abs(y-IMPORTER.height_at(grid,heights,x,z)),.00500001)
                    mx=(a[0]+b[0]+c[0])/3;mz=(a[2]+b[2]+c[2])/3
                    expected=IMPORTER.height_at(grid,heights,mx,mz)
                    self.assertLessEqual(abs((a[1]+b[1]+c[1])/3-expected),.00500001)
                    col=math.floor((mx-grid['minX'])/25);row=math.floor((mz-grid['minZ'])/25)
                    x0=grid['minX']+col*25;z0=grid['minZ']+row*25
                    u=[(v[0]-x0)/25 for v in (a,b,c)];v=[(v[2]-z0)/25 for v in (a,b,c)]
                    self.assertGreaterEqual(min(u+v),-1e-9)
                    self.assertLessEqual(max(u+v),1+1e-9)
                    d=[x-z for x,z in zip(u,v)]
                    self.assertTrue(min(d)>=-1e-9 or max(d)<=1e-9)
                self.assertTrue(all(n in (1,2) for n in edges.values()))


if __name__=='__main__':
    unittest.main()
