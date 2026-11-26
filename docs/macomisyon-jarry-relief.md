# Jarry : géographie et relief

La présentation plate est rétablie à la demande de Marvin : mer plane et cadrage géographique, sans cube ni fond sous-marin décoratif. Les altitudes terrestres IGN, les rues et la végétation sont conservées. Les crédits restent dans « À propos » après leur affichage initial.

## Direction du 22 octobre 2026

Le fond de carte suit les rues, le littoral, les zones végétales et le terrain réels de Jarry. Les quatre lieux Macomisyon restent des créations localisées. Le quartier ne reçoit ni collines inventées ni amplification verticale : une unité de scène représente 20 mètres dans les trois axes. Les matériaux restent ceux d'une miniature, avec des façades claires, une végétation verte et une eau turquoise.

Les noms des rues sont maintenant lisibles au rapprochement, à partir des seuls noms OSM. Les lieux des projets conservent leurs noms anonymes et leurs parcours existants.

## Étude d'Istwa Politik

L'inspection du [site de référence](https://istwa-politik.gotech.gg/) le 22 octobre confirme Three.js et des données préparées hors navigateur. Le panneau « À propos & données » cite Terrain Tiles pour les altitudes et OpenStreetMap pour les routes et bâtiments. Les ressources `/data/prepared/guadeloupe.json` et leurs fichiers binaires compressés séparent la préparation géographique du rendu interactif.

La bonne approche pour Macomisyon est cette séparation, en conservant la scène Three.js existante. La source régionale d'Istwa utilise une grille de 440 × 440 sur l'archipel et des contours généralisés à 100 m ; elle ne doit pas être reprise comme géométrie d'un quartier.

Une vérification de la tuile Terrarium `15/10780/14885.png` révèle une source SRTM, un fichier modifié en 2017 (pas une date de relevé), et trois pixels inférieurs à −100 m, dont −2 950,52 m autour de `−61.56736135, 16.23579269`. L'API IGN y indique −0,67 m. Le zoom d'une tuile rééchantillonnée ne constitue pas sa précision réelle. Le relief de cette reprise utilise donc prioritairement le MNT IGN, sans reprendre les données préparées du site de référence.

Sources : [formats Terrain Tiles](https://github.com/tilezen/joerd/blob/master/docs/formats.md), [sources et résolutions](https://github.com/tilezen/joerd/blob/master/docs/data-sources.md), [calcul altimétrique IGN](https://cartes.gouv.fr/aide/fr/guides-utilisateur/utiliser-les-services-de-la-geoplateforme/calcul-altimetrique/).

## Bâtiments et contexte OSM

Le contexte du 28 juillet 2026 reste strictement conservé : 1 643 tronçons de routes, huit surfaces terrestres, 19 tronçons de littoral, 101 surfaces végétales, 34 surfaces d'eau et 15 zones industrielles. L'emprise et la projection restent identiques. Leur description et les anciennes requêtes figurent dans la [provenance OSM](macomisyon-geography-sources.md).

Le nouvel instantané des bâtiments date du **22 octobre 2026 à 07:33:51 UTC**, reçu à 07:35:28 UTC via `https://overpass-api.de/api/interpreter`. La réponse comprend 8 610 éléments (8 589 chemins et 21 relations). Son SHA-256 est `0967899d3557c96158499837c20ca3f15c6eff3637cf36ca965e672cdecbf195`.

L'export conserve **5 693 empreintes**, sans plafond arbitraire. Le seuil existant de 35 m² retire 2 915 polygones. `building=no` est exclu et deux chemins extérieurs sont remplacés par leur relation, sans doublonnage. Les surfaces restent simplifiées à un mètre ; ce fichier n'est pas un cadastre exhaustif.

Chaque hauteur conserve sa provenance : **19 `osm-height`**, **41 `levels-estimate`** et **5 633 inconnues**. Les inconnues restent `null` dans les données. L'estimation par étage utilise 3 mètres. Le rendu utilise 4,5 mètres pour le bâti ordinaire inconnu et 7 mètres pour les grands bâtiments et bâtiments industriels/commerciaux inconnus. Il ne borne plus les hauteurs renseignées entre 9 et 30 mètres. Les couleurs et formes des toitures restent interprétées.

La collecte, ses dates, sa requête et ses empreintes figurent dans `jarry-osm.json > meta.buildingImport`. Les sources brutes et rapports de cette préparation sont dans `/tmp/macomisyon-jarry-geo` ; ce dossier temporaire n'en garantit pas la conservation.

Pour remplacer uniquement le bâti depuis une nouvelle réponse locale :

```sh
python scripts/import-jarry-geography.py \
  --base-scene /chemin/vers/jarry-osm-avant.json \
  --input-dir /chemin/vers/sources-osm \
  --building-provenance /chemin/vers/sources-osm/buildings-provenance.json \
  --output-dir /chemin/vers/export
```

Le manifeste de collecte contient `sha256`, `endpoint`, `query` et `fetchedAt`. L'importeur ne télécharge rien et ne remplace pas les fichiers de l'application. Il refuse les réponses Overpass partielles et les géométries invalides après arrondi. Les dépendances Python sont réservées à la préparation.

## Relief préparé

`jarry-elevation.json` contient une grille **221 × 207**, soit **45 747 nœuds espacés de 25 m**. La collecte du 22 octobre 2026 utilise `ign_rge_alti_wld`, avec 36 104 altitudes conservées. La résolution native, le millésime du relevé et l'exactitude verticale propre à Jarry ne sont pas exposés par l'API : ils restent inconnus. Le pas de 25 m décrit l'échantillonnage de l'export, pas sa précision.

Les 8 862 sentinelles/valeurs absentes et 781 valeurs hors garde régionale [−10, 150] m sont rejetées, sans les ramener à une borne. Elles sont remplacées par une source indépendante Terrain Tiles z12, dont les pixels utilisés passent leur propre contrôle. **Seulement huit des 9 643 nœuds secondaires sont situés sur les terres OSM**, côté ouest ; aucun des quatre sites n'utilise cette source secondaire. Les indices exacts et empreintes des réponses sont conservés dans les métadonnées. Le pas apparent de la tuile secondaire est d'environ 36,694 m ; sa résolution native n'est pas établie. Le référentiel vertical IGN est GUAD88/IGN 1988, EPSG:5757 ; le décalage éventuel avec le secours n'est pas établi.

Les altitudes IGN légèrement négatives sont conservées. La grille complète s'étend de −11,43 à 42,13 m ; elle n'est ni lissée ni amplifiée. Aux centres des lieux, le terrain vaut respectivement 16,70 m (banque), 3,30 m (hangar), 6,20 m (maison) et 13,78 m (atelier). L'assise des modèles dépend du maximum du terrain sous leurs socles et parvis, et des fondations rejoignent le sol : ces valeurs centrales ne sont donc pas les altitudes des planchers.

`jarry-surfaces.json` conserve 106 493 triangles : 60 522 de terre, 17 701 industriels, 28 032 végétaux et 238 d'eau. Chaque couche sèche est intersectée avec les terres puis privée des polygones d'eau. Le maillage et les objets utilisent la même interpolation linéaire sur les deux triangles NW–SE de chaque cellule. Le contrôle exhaustif des fichiers sérialisés ne trouve aucune jonction ouverte, aucun triangle dégénéré ou inversé, ni triangle sec sortant de sa demi-cellule. L'arrondi au centimètre crée au plus 5 mm d'écart vertical et 7,018 mm de déplacement horizontal ; ces erreurs numériques ne décrivent pas l'exactitude du relevé.

L'eau intérieure est plane par polygone, au niveau médian du terrain échantillonné sur son bord. Ce niveau est déduit, pas mesuré hydrologiquement. La présentation plate utilise un plan marin continu ; les faibles altitudes terrestres peuvent passer sous ce plan, sans modification des données IGN. La grille de 25 m ne décrit pas les bordures, fossés, petites digues ou ruptures de quai.

La projection locale existante est conservée pour toutes les couches. Son axe nord-sud diffère d'environ 0,59 % d'une mesure ellipsoïdale WGS84 sur cette emprise ; une migration UTM devra reprojeter toutes les couches ensemble.

Préparation Python (Shapely 2.2.0, numpy 2.5.4, Pillow 12.3.0), séparée du runtime :

```sh
# Acquisition explicite, avec cache et empreintes ; ne remplace pas l'export.
python scripts/import-jarry-elevation.py acquire \
  --osm app/lib/macomisyon/data/jarry-osm.json --source-dir /chemin/vers/sources-relief
# Reconstruction hors réseau : vérifie les sources puis écrit les deux JSON.
python scripts/import-jarry-elevation.py build \
  --osm app/lib/macomisyon/data/jarry-osm.json \
  --source-dir /chemin/vers/sources-relief --output-dir /chemin/vers/export
```

Le cache de cette collecte est `/tmp/jarry-relief-source`, le rapport `/tmp/jarry-elevation-validation.json`. La reconstruction depuis ce cache a produit deux fichiers identiques octet par octet. Archiver les sources brutes avant un nettoyage de `/tmp` si leur conservation est nécessaire ; les fichiers applicatifs restent autonomes.

## Rendu et limites

Les routes conservent leur géométrie horizontale OSM. Elles sont densifiées avant de suivre le terrain. Les largeurs restent estimées selon leur classe ; les ponts reçoivent un tablier conventionnel raccordé aux berges, car le MNT décrit le sol et non l'ouvrage. Les noms des rues sont affichés seulement lorsqu'ils disposent d'espace, sans chevaucher les repères des projets.

Les faces des rubans routiers sont elles-mêmes découpées aux triangles du DEM, y compris leurs bords. Les 21 ponts reprennent le profil transversal du terrain aux culées puis passent progressivement au tablier. Cette géométrie corrige les quatre enfouissements détectés dans la première intégration et les marches aux raccordements de ponts. Les 1 643 rubans représentent 271 254 triangles ; leur génération seule a pris environ 205 ms sous Node sur le Mac de développement, hors préparation des axes et fusion. Ce chiffre n'est pas une mesure de fluidité sur téléphone.

Les limites végétales sont conservées, y compris les mangroves et les trous des polygones. Les arbres sont plus petits et répartis uniquement dans ces zones, hors routes, bâtiments et emplacements réservés. Leur espèce, position individuelle, taille et densité sont interprétées ; il ne s'agit pas d'un inventaire arboré.

Les géométries de même matériau sont fusionnées et les arbres instanciés. Le navigateur utilise exclusivement les fichiers préparés du dépôt : aucune requête Overpass ou IGN lors d'une visite.

L'attribution OSM reste liée à sa licence ODbL. Source : IGN — RGE ALTI®, consultation du 22 octobre 2026 — Licence Ouverte 2.0. Le secours Terrain Tiles / Mapzen / AWS contient SRTM et GMTED2010, fournis par l'U.S. Geological Survey ; ses [attributions](https://github.com/tilezen/joerd/blob/master/docs/attribution.md) sont liées depuis la carte. Une valeur exprimée avec deux décimales ne prouve pas une précision centimétrique. Les données réelles et les compteurs de démo sont des sujets distincts.

## Validation locale du 22 octobre 2026

Cible : `feat/jarry-relief`, modifications locales sur `fbe7a2b`, route `http://127.0.0.1:3096/macomisyon`. Aucun commit, push, merge ou déploiement distant n'a été réalisé pour cette reprise.

- `npm run test:macomisyon` : **94 tests réussis**, dont les dix nouveaux contrôles relief/fondations/routes et les 84 tests banque/hangar existants. Les routes sont vérifiées contre les véritables JSON, sur toutes leurs faces et les 21 ponts. Une régression supplémentaire couvre les miters de pont repliés ; sa correction conserve positions, indices et normales des 21 ponts réels identiques octet par octet.
- `PYTHONDONTWRITEBYTECODE=1 /tmp/macomisyon-jarry-geo-tools/bin/python -m unittest discover -s scripts -p 'test_import_jarry_*.py'` : **14 tests réussis**, imports OSM et relief.
- ESLint sur les fichiers JavaScript/Vue modifiés, les nouveaux tests et `verify-jarry-relief.mjs` ; `git diff --check` : réussis.
- `DEMO_URL=http://127.0.0.1:3096/macomisyon node scripts/verify-macomisyon.mjs` : **10 contrôles réussis** sur le serveur de développement, dont progression du hangar, persistance, retour à la carte, perte/restauration WebGL et accès sans WebGL.
- `DEMO_URL=http://127.0.0.1:3096/macomisyon node scripts/verify-jarry-navigation.mjs` : **11 contrôles réussis**, gestes tactiles réels CDP, zoom, glissement sur repère, pincement, bornes, restauration du cadrage et mouvement réduit.
- `node node_modules/nuxt/bin/nuxt.mjs build` : build Nuxt/Nitro réussi. Le CMS n'a pas été reconstruit, ses fichiers n'étant pas modifiés. Les avertissements concernent Browserslist, les sourcemaps des plugins et la taille de certains paquets.
- Après arrêt du serveur de développement : `HOST=127.0.0.1 PORT=3096 node .output/server/index.mjs`. Le paquet géographique `BJJU192U.js` servi répond HTTP 200 et est identique au fichier compilé, SHA-256 `b0f9053966ebccfbf26a7fc702edea3647cf5420f91db9902ba32eb0da2da15f`.
- Sur ce build servi : `verify-jarry-relief.mjs` valide les vues générales et les quatre lieux à **1440 × 1000** et **390 × 844**, les vrais noms OSM, les attributions sans chevauchement des commandes, l'absence de débordement et de requête géographique distante. `smoke-memebank-production.mjs` valide les deux parcours ordinateur/mobile, l'entrée, les étapes et le retour à la carte, sans inspection privée de Vue.

Les captures finales et le rapport des vues sont dans `.impeccable/review/jarry-relief/`. Les revues indépendantes ont confirmé les extrema des fondations et la correction de la hauteur du camion. Les captures du navigateur intégré ayant échoué avec `Preview automation snapshot timed out after 15000ms`, la revue visuelle utilise le Chromium des scripts Playwright du dépôt. Les captures ordinateur, mobile et des quatre lieux ont été inspectées par l'agent.

Le paquet contenant la géographie mesure 4,71 Mo minifié (1,27 Mo gzip annoncé par le build). Il reste chargé à l'entrée de la scène. Les performances sur un téléphone physique et un réseau mobile ne sont pas mesurées ; les contrôles mobiles ci-dessus utilisent une émulation Chromium. La validation visuelle humaine reste à faire.

## Retour à la présentation plate, 22 octobre 2026

Après rejet du cube et des fonds sous-marins, leurs géométries, matériaux, ombre et cadrage spécifiques sont retirés. La mer plane et le cadrage précédent sont rétablis ; les données terrestres, fondations, routes, végétation et cibles de caméra en hauteur restent conservées. « À propos » et les crédits temporaires restent en place.

Après ce retrait : **94 tests réussis**, ESLint ciblé, `git diff --check` et build Nuxt/Nitro réussis. Sur le nouveau serveur compilé local, `verify-jarry-relief.mjs` et `smoke-memebank-production.mjs` passent sur ordinateur et mobile émulé : quatre lieux, noms de rues, crédits, parcours bancaire et retour à la carte, sans erreur JavaScript ni débordement. Les captures générales ordinateur/mobile ont été inspectées et comparées au rendu antérieur au cube ; preuves dans `.impeccable/review/jarry-flat-restored/`.

Le paquet servi `DfoR6Ar4.js` répond HTTP 200 et correspond exactement au fichier compilé (SHA-256 `5848e843762de435bb4993ea2bfae4c371e4d7eb08fc82be22778ca69d1165a3`). Serveur local maintenu sur `http://127.0.0.1:3096/macomisyon`. Aucun commit, push ou déploiement distant.
