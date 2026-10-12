# Sources géographiques de Maco’misyon

Le décor utilise un extrait vectoriel OpenStreetMap de Jarry, de La Jaille à la pointe portuaire. Le fichier consommé par l’application est [`app/lib/macomisyon/data/jarry-osm.json`](../app/lib/macomisyon/data/jarry-osm.json). Les noms, bâtiments et transformations propres aux projets restent une création du monde Maco’misyon, sans correspondance avec des établissements réellement installés à ces emplacements.

La géométrie sert à reconnaître la péninsule, les routes et la mangrove. Elle ne constitue pas un relevé cadastral, un inventaire complet des bâtiments, une information de circulation ou une mesure des hauteurs actuelles.

## Origine et licence

Les données proviennent des contributeurs OpenStreetMap, via l’API publique `https://overpass.private.coffee/api/interpreter`. Cette instance figure dans la [liste officielle des instances Overpass](https://wiki.openstreetmap.org/wiki/Overpass_API). La méthode d’interrogation est documentée par [Overpass](https://dev.overpass-api.de/command_line.html).

Conserver dans l’interface l’attribution **© OpenStreetMap contributors**, liée à [openstreetmap.org/copyright](https://www.openstreetmap.org/copyright). Les données sont sous ODbL 1.0. Le JSON exporté conserve cette attribution, la licence et les dates des sources dans `meta`.

La collecte effectuée pendant la session du 12 octobre 2026 a reçu des instantanés de juillet, et non des données datées du jour de la collecte :

| Fichier brut | Date annoncée par `osm3s.timestamp_osm_base` | Éléments reçus |
| --- | --- | ---: |
| `osm-context.json` | `2026-07-28T02:16:18Z` | 5 244 |
| `osm-buildings.json` | `2026-07-15T15:22:01Z` | 8 589 |

Empreintes SHA-256 des deux réponses utilisées :

```text
osm-context.json
3ee7133d00e89a52c49cd79b31c0b665cc39ad5bdd8a24e92f7731561bcd80f9

osm-buildings.json
1a9b8ddb13c9e84144ebe3bc0755c2bb94bf83723c20813c95f5084c32dc1d34
```

Les fichiers bruts ne sont pas versionnés dans ce dépôt. Ils ont été conservés pendant la préparation dans `/tmp/macomisyon-jarry-geo`, emplacement temporaire qui ne garantit pas leur conservation. Pour reproduire exactement cet export, conserver ces deux réponses ailleurs avec leurs empreintes. Une nouvelle interrogation du service peut fournir une autre date, un autre contenu et des comptages différents.

## Emprise et coordonnées

L’emprise exportée est `west=-61.590`, `south=16.217`, `east=-61.539`, `north=16.263`. L’extraction du contexte est volontairement plus large pour reconstruire la côte avant découpage. Le cadrage comprend aussi un peu de territoire voisin, notamment l’autre rive à l’est ; toutes les géométries du rectangle ne sont donc pas situées dans Jarry.

L’origine est `longitude=-61.5645`, `latitude=16.24`. La projection locale équirectangulaire utilise un rayon terrestre de 6 378 137 mètres, avec la longitude corrigée par le cosinus de la latitude d’origine :

```text
x = (longitude + 61.5645) × 106877.69607312146
z = (latitude - 16.24) × -111319.49079327357
```

Les valeurs du JSON sont en mètres. L’est correspond à `+X`, le nord à `-Z`. Le rectangle mesure 5 450,76 × 5 120,70 mètres. La suggestion `/20` donne 272,54 × 256,04 unités de scène ; elle ne modifie pas les valeurs du fichier source. Cette projection locale et les simplifications servent au décor miniature, pas à des mesures de précision.

Les surfaces utilisent `outer` et `holes`, tableaux de couples `[x, z]`. Leur dernier point ne répète pas le premier ; le moteur doit fermer les anneaux. Les routes et le littoral utilisent `points`. Les identifiants `way/<id>` et `relation/<id>` permettent de revenir aux éléments OSM.

## Transformation appliquée

Le script [`scripts/import-jarry-geography.py`](../scripts/import-jarry-geography.py) lit exclusivement des fichiers locaux explicitement fournis. Il ne télécharge rien, ne copie rien dans l’application et ne lance aucun serveur.

1. Les lignes `natural=coastline` sont projetées et découpées à l’emprise. Elles sont polygonisées avec le bord du cadrage. Selon la [convention OSM](https://wiki.openstreetmap.org/wiki/Tag:natural%3Dcoastline), la terre se trouve à gauche de la ligne orientée, l’eau à droite. Le script compare des points de part et d’autre de chaque segment pour classer les surfaces. Il refuse une orientation ambiguë. Les segments qui ferment le rectangle sont des limites de découpage, jamais des portions de rivage supposées.
2. Les surfaces d’eau, de végétation et d’usage du sol sont reconstruites à partir des chemins fermés et des relations multipolygones. Les anneaux intérieurs sont conservés. Les catégories de mangrove viennent de [`wetland=mangrove`](https://wiki.openstreetmap.org/wiki/Tag:wetland%3Dmangrove), et non d’un placement aléatoire d’arbres.
3. Les routes gardent leur classe OSM, leur nom lorsqu’il existe, leur référence et l’indication de pont. Les allées de stationnement, accès de parcelle et certains petits chemins de service sont écartés. Les segments de moins de huit mètres sont écartés. Les voies en construction présentes dans la source gardent leur classe `construction` ; cela ne confirme pas leur état actuel.
4. Les empreintes bâties sont découpées, simplifiées et filtrées à partir de 35 m². Leur point intérieur doit se trouver sur la terre reconstruite. La sélection conserve les 700 plus grandes, puis jusqu’à 800 autres en alternant entre des cellules de 250 mètres. Le résultat comprend **1 500 empreintes sur les 8 589 éléments bâtis reçus**. Il ne prétend pas reproduire tous les bâtiments.
5. Les simplifications conservent la topologie des surfaces : trois mètres pour la terre et la végétation, deux mètres pour les routes, un mètre pour les bâtiments. Les coordonnées sont arrondies au centimètre pour le stockage, sans que cet arrondi constitue une précision de mesure. La validité des polygones exportés est vérifiée après cet arrondi.

L’export de cette session comprend huit surfaces de terre, 19 tronçons de littoral, 34 surfaces d’eau, 101 surfaces végétales dont 13 mangroves, 15 zones industrielles, 1 643 segments routiers, 1 500 empreintes bâties et 12 repères nommés. `industrial` et `landuse` contiennent actuellement les mêmes 15 zones industrielles pour compatibilité avec le rendu. Ne pas les dessiner deux fois.

Les requêtes supplémentaires pour obtenir des zones commerciales ont échoué avec HTTP 500. Aucune zone commerciale n’a été inventée pour les remplacer. L’instance principale Overpass a également renvoyé HTTP 504 avant le recours à l’instance indiquée ci-dessus.

## Limites des hauteurs et du rendu

Parmi les 1 500 empreintes retenues :

- 18 ont un `height` OSM que l’importeur a pu interpréter ; ce sont des valeurs de la source, sans vérification sur place.
- 26 ont une hauteur estimée à partir de `building:levels × 3 m`. La hauteur d’étage est une convention de rendu, pas une mesure.
- 1 456 gardent `height: null`. Cela comprend une valeur source `10,50` non interprétée par cette version de l’importeur.

Les 44 valeurs non nulles ne doivent donc pas être présentées comme 44 hauteurs mesurées. Toute hauteur de remplacement, couleur de façade, toiture, arbre individuel ou implantation d’un projet est une stylisation. Les instantanés de juillet 2026 ne permettent pas non plus d’affirmer l’état actuel du port, des chantiers ou des bâtiments.

## Rejouer la transformation locale

Python, Shapely et Pillow sont des outils de préparation facultatifs. Ils ne sont nécessaires ni au serveur Nuxt, ni au navigateur, ni à un build de l’application utilisant le JSON déjà présent. La préparation initiale a utilisé Python 3.12.12, Shapely 2.2.0 et Pillow 12.3.0. Pillow sert uniquement à l’aperçu demandé avec `--overview` ; `pyproj` n’est pas requis.

Depuis la racine du dépôt, avec deux répertoires de travail explicitement choisis :

```sh
python3 -m venv /chemin/vers/outillage-jarry
/chemin/vers/outillage-jarry/bin/python -m pip install 'shapely==2.2.0' 'pillow==12.3.0'

/chemin/vers/outillage-jarry/bin/python scripts/import-jarry-geography.py \
  --input-dir /chemin/vers/sources-jarry \
  --output-dir /chemin/vers/export-jarry \
  --overview
```

Le répertoire d’entrée doit contenir `osm-context.json` et `osm-buildings.json`. Un fichier `osm-extra.json` est accepté lorsqu’un complément a été collecté volontairement ; il était absent de l’export décrit ici. Sa présence modifie potentiellement le résultat et apparaît dans les empreintes du rapport de validation.

Le script produit `jarry-osm.json`, `validation.json` et, avec `--overview`, `jarry-topdown.png`. Le rapport indique les empreintes des réponses brutes, les comptages, la classification terre/eau et les polygones invalides. Une erreur de source ou de géométrie interrompt l’export. Examiner le rapport et l’aperçu avant de remplacer volontairement le JSON de l’application. L’importeur ne réalise pas ce remplacement.

## Refaire une collecte, explicitement

Ces commandes font des requêtes réseau en lecture seule. Elles sont distinctes de l’importeur local. Choisir un répertoire extérieur au dépôt pour les réponses brutes et conserver les erreurs HTTP ; ne pas traiter une réponse partielle comme un export complet.

```sh
jarry_sources='/chemin/vers/sources-jarry'
mkdir -p "$jarry_sources"

cat > "$jarry_sources/query-context.overpassql" <<'OVERPASS'
[out:json][timeout:45];
(
  way[highway](16.212,-61.600,16.270,-61.535);
  way[natural](16.205,-61.610,16.278,-61.525);
  relation[natural](16.205,-61.610,16.278,-61.525);
  way[landuse~"forest|grass|recreation_ground|industrial"](16.212,-61.600,16.270,-61.535);
  node[place](16.212,-61.600,16.270,-61.535);
);
out body geom;
OVERPASS

curl --fail --show-error --max-time 90 \
  --user-agent 'MacoMisyonGeographyStudy/1.0' \
  --data-urlencode "data@$jarry_sources/query-context.overpassql" \
  'https://overpass.private.coffee/api/interpreter' \
  --output "$jarry_sources/osm-context.json"

cat > "$jarry_sources/query-buildings.overpassql" <<'OVERPASS'
[out:json][timeout:45];
(
  way[building](16.217,-61.590,16.263,-61.539);
);
out body geom;
OVERPASS

curl --fail --show-error --max-time 90 \
  --user-agent 'MacoMisyonGeographyStudy/1.0' \
  --data-urlencode "data@$jarry_sources/query-buildings.overpassql" \
  'https://overpass.private.coffee/api/interpreter' \
  --output "$jarry_sources/osm-buildings.json"
```

Ce sont les périmètres et sélections des deux requêtes ayant fourni les réponses utilisées. Le fichier temporaire `query-buildings.overpassql` de la collecte initiale conservait une autre tentative échouée, limitée à l’est par `-61.545` ; il ne faut pas l’utiliser comme preuve de la requête réussie. La commande ci-dessus reprend la requête réussie, limitée à l’est par `-61.539`.
