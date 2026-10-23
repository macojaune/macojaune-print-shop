"""Offline regressions; run with Python and Shapely installed, no network needed."""

import copy
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

from shapely import normalize
from shapely.geometry import Polygon

SCRIPT = Path(__file__).with_name("import-jarry-geography.py")
spec = importlib.util.spec_from_file_location("jarry_import", SCRIPT)
importer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(importer)


def way(identifier, west=-61.58, south=16.25, size=0.0001, **tags):
    return {
        "type": "way", "id": identifier,
        "tags": {"building": "yes", **tags},
        "geometry": [{"lon": lon, "lat": lat} for lon, lat in [
            (west, south), (west + size, south),
            (west + size, south + size), (west, south + size), (west, south),
        ]],
    }


class Heights(unittest.TestCase):
    def test_metric_and_imperial_units_without_clamp(self):
        for source, expected in [
            ("10,50", 10.5), ("12 m", 12), ("12m", 12), ("12 mètres", 12),
            ("12.5 metres", 12.5), ("10 ft", 3.048), ("10 feet", 3.048),
            ("10'", 3.048), ("7'4\"", 2.2352), ("10,5 ft", 3.2004),
            ("0.5", 0.5), ("950", 950),
        ]:
            with self.subTest(source=source):
                self.assertAlmostEqual(importer.parse_height(source), expected)
                self.assertEqual(importer.building_height({"height": source})[1], "osm-height")

    def test_provenance_and_unknown_values(self):
        self.assertEqual(importer.building_height({"height": "7", "building:levels": "4"}), (7, "osm-height"))
        self.assertEqual(importer.building_height({"height": "unknown", "building:levels": "2,5"}), (7.5, "levels-estimate"))
        self.assertEqual(importer.building_height({"building:levels": "60"}), (180, "levels-estimate"))
        for value in [None, "", "NaN", "inf", "-5", "0", "1;2", "3-5", ">20", "10 km", "7'14\"", "9" * 400]:
            with self.subTest(value=value):
                self.assertEqual(importer.building_height({"height": value}), (None, None))
        for value in ["NaN", "3 m", "3;4", "0", "-1"]:
            self.assertEqual(importer.building_height({"building:levels": value}), (None, None))


class Import(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.directory = Path(self.temp.name)
        self.base = json.loads((SCRIPT.parents[1] / "app/lib/macomisyon/data/jarry-osm.json").read_text())
        # Synthetic land lets fixtures exercise the importer independently of OSM changes.
        self.base["land"] = [{"id": "fixture-land", "outer": [
            [-2725.38, -2560.35], [2725.38, -2560.35],
            [2725.38, 2560.35], [-2725.38, 2560.35],
        ], "holes": [], "area": 27911273.932}]
        self.base["meta"]["counts"]["land"] = 1
        self.base_path = self.directory / "base.json"
        self.base_path.write_text(json.dumps(self.base))

    def run_import(self, elements, remark=None, expect_success=True, full=False):
        source = {"osm3s": {"timestamp_osm_base": "2026-07-15T15:22:01Z"}, "elements": elements}
        if remark:
            source["remark"] = remark
        (self.directory / "osm-buildings.json").write_text(json.dumps(source))
        args = [sys.executable, "-B", str(SCRIPT), "--input-dir", str(self.directory),
                "--output-dir", str(self.directory / "export")]
        if full:
            coast = {"type": "way", "id": 90001, "tags": {"natural": "coastline"},
                     "geometry": [{"lon": -61.54, "lat": 16.20}, {"lon": -61.54, "lat": 16.28}]}
            (self.directory / "osm-context.json").write_text(json.dumps({**source, "elements": [coast]}))
        else:
            args += ["--base-scene", str(self.base_path)]
        result = subprocess.run(args, capture_output=True, text=True)
        if expect_success:
            self.assertEqual(result.returncode, 0, result.stderr)
            return json.loads((self.directory / "export/jarry-osm.json").read_text())
        self.assertNotEqual(result.returncode, 0)
        return result

    def test_all_eligible_footprints_and_preserved_layers(self):
        elements = [way(i, west=-61.589 + (i % 80) * 0.0005,
                        south=16.218 + (i // 80) * 0.0005) for i in range(1605)]
        scene = self.run_import(elements)
        self.assertEqual(len(scene["buildings"]), 1605)
        for key in self.base:
            if key not in ("meta", "buildings"):
                self.assertEqual(scene[key], self.base[key], key)
        for key in self.base["meta"]:
            if key not in ("buildingImport", "buildingSnapshot", "notes", "counts"):
                self.assertEqual(scene["meta"][key], self.base["meta"][key], key)
        self.assertEqual(scene, self.run_import(elements))
        reordered = self.run_import(list(reversed(elements)))
        self.assertEqual(scene["buildings"], reordered["buildings"])
        self.assertEqual(scene["meta"]["buildingImport"]["counts"], reordered["meta"]["buildingImport"]["counts"])

    def test_duplicates_exclusions_and_height_sources(self):
        a = way(1, height="10,50")
        duplicate = copy.deepcopy(a)
        duplicate["id"] = 2
        duplicate["geometry"].reverse()
        elements = [a, a, duplicate, way(3, west=-61.579, building="no"),
                    way(4, west=-61.578, **{"building:levels": "2"}),
                    way(5, west=-61.577, size=0.00001),
                    way(6, west=-61.55)]
        scene = self.run_import(elements)
        self.assertEqual([b["heightSource"] for b in scene["buildings"]], ["osm-height", "levels-estimate", None])
        self.assertEqual(scene["buildings"][0]["height"], 10.5)
        counts = scene["meta"]["buildingImport"]["counts"]
        for key in ("duplicateSourceElements", "duplicateFootprints", "buildingNo", "belowMinimumArea"):
            self.assertEqual(counts[key], 1, key)

    def test_relation_holes_outer_ways_and_invalid_relation_fallback(self):
        outer = way(1, size=0.001)
        inner = way(2, west=-61.5798, south=16.2502, size=0.0003)
        relation = {"type": "relation", "id": 10,
                    "tags": {"building": "yes", "type": "multipolygon"}, "members": [
                        {"type": "way", "ref": 1, "role": "outer", "geometry": outer["geometry"]},
                        {"type": "way", "ref": 2, "role": "inner", "geometry": inner["geometry"]},
                    ]}
        scene = self.run_import([outer, relation])
        self.assertEqual(len(scene["buildings"]), 1)
        self.assertEqual(len(scene["buildings"][0]["holes"]), 1)
        self.assertTrue(Polygon(scene["buildings"][0]["outer"], scene["buildings"][0]["holes"]).is_valid)
        relation["members"][0]["geometry"] = outer["geometry"][:2]
        scene = self.run_import([outer, relation])
        self.assertEqual([b["id"] for b in scene["buildings"]], ["way/1/0"])

    def test_repaired_polygons_and_clipped_polygons_are_valid(self):
        bowtie = way(1, size=0.0003)
        coords = bowtie["geometry"]
        bowtie["geometry"] = [coords[i] for i in (0, 2, 1, 3, 0)]
        scene = self.run_import([bowtie, way(2, west=-61.59005, size=0.0002)])
        self.assertEqual(len(scene["buildings"]), 3)
        geometries = [Polygon(b["outer"], b["holes"]) for b in scene["buildings"]]
        self.assertTrue(all(p.is_valid and p.area > 0 for p in geometries))
        self.assertEqual(len({normalize(p).wkb for p in geometries}), len(geometries))

    def test_invalid_response_cannot_overwrite_export(self):
        self.run_import([way(1)])
        exported = self.directory / "export/jarry-osm.json"
        before = exported.read_bytes()
        self.run_import([way(2)], remark="runtime error: query timed out", expect_success=False)
        self.assertEqual(exported.read_bytes(), before)
        malformed = way(2)
        del malformed["geometry"][0]["lon"]
        self.run_import([malformed], expect_success=False)
        self.assertEqual(exported.read_bytes(), before)

    def test_full_context_import_remains_supported(self):
        scene = self.run_import([way(1, height="200")], full=True)
        self.assertEqual(len(scene["buildings"]), 1)
        self.assertEqual(scene["buildings"][0]["height"], 200)
        self.assertEqual(len(scene["land"]), 1)


if __name__ == "__main__":
    unittest.main()
