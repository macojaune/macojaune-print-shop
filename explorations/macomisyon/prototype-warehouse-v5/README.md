# Le dépôt Q · POC v5

Entrepôt miniature de QuiLivreOù dans Maco’misyon. La v4 reste intacte dans `../prototype-warehouse-v4/`.

## Ouvrir

Avec Node.js 20+ et Python 3 :

```sh
npm ci --ignore-scripts
npm start
```

Ouvrir http://127.0.0.1:58016/. Aucun compte ni secret nécessaire.

## Jouer la démo

Glisser pour explorer, pincer ou utiliser les boutons pour zoomer. Toucher Q ouvre le dossier du projet. L’inventaire localise une Komisyon dans le dépôt ; toucher son point ou utiliser le bouton du bas ouvre ensuite son briefing. Le bouton de prérequis nous emmène à l’étape requise.

Les étapes verrouillées affichent un cadenas et un indice au toucher. Dans « Mode démo », un réglage permet de comparer avec les noms révélés. Les commandes de contribution sont regroupées dans cette console et ne déclenchent aucune action sur le vrai site.

La console propose cinq scénarios : accident, recommandations reçues en avance, deux missions ouvertes, quai ouvert et bonus seul. Ces scénarios remplacent l’avancement local pour comparer les situations.

### Une progression qui conserve les contributions

- Le départ compte **2 inscrits sur 10**. Q est renversé, sa palette et ses colis sont au sol.
- Les recommandations et les boutiques attendent les dix inscrits, mais leurs compteurs avancent déjà.
- Avec **2 inscrits et 5 recommandations**, les recommandations sont en réserve. Atteindre dix inscrits accomplit les deux missions : Q se redresse et les colis sont rassemblés.
- Après les inscrits, recommandations et boutiques peuvent avancer en parallèle et être accomplies dans n’importe quel ordre.
- Les trois principales accomplies ouvrent le rideau. Le chariot emmène les colis au quai, puis la cargaison sort. La caméra revient à la vue d’ensemble pour voir ce départ.
- Le bonus de destinations enrichit le décor sans conditionner la réparation.

Les annonces de réussite ne se rejouent pas au rechargement. Les activités de chaque état, dont la tournée du Fenwick une fois réparé, démarrent à chaque visite. La v5 utilise son propre stockage local, sans toucher à la v4. Si le stockage est indisponible, elle reste utilisable pour la session. Les gestes et les animations respectent la préférence de mouvement réduit.


## Le dépôt reste en activité

Une tournée dure 22 secondes. Q charge, soulève la palette, l’emmène au quai et la dépose. Il revient à vide au point de départ, attend puis recommence. La première remise en service garde sa transition de réparation, puis enchaîne sur ce retour. Un visiteur arrivant sur un dépôt déjà réparé voit directement une nouvelle tournée. Les cycles ne modifient ni les compteurs ni les acquis.

Pendant la panne, les balises ambre varient progressivement. L’éclairage de fond reste stable et lisible. Les signaux de mission et les équipements acquis ajoutent des mouvements localisés. Il n’y a ni stroboscope, ni alternance rouge/blanc, ni extinction répétée de toute la scène.

« Pause » sur la carte, également disponible dans la console, arrête les mouvements et les variations lumineuses. Ce choix est conservé. Le mode de mouvement réduit de l’appareil affiche un dépôt calme ; les acquis, les missions et la caméra restent accessibles. L’horloge est suspendue lorsque l’onglet est masqué ou le dépôt hors champ, sans rattrapage au retour. L’ambiance est plafonnée à 30 images par seconde ; la caméra garde sa réactivité.

Ces choix suivent les indications du W3C sur [les flashes](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html) et [l’arrêt des animations continues](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html). Ils ne remplacent pas une analyse de photosensibilité du rendu final. Aucun outil spécialisé d’analyse des flashes n’a été exécuté.

## Références de travail 3D

Recherche via Find Skills. Guides consultés : [Three.js Animation](https://github.com/CloudAI-X/threejs-skills/blob/main/skills/threejs-animation/SKILL.md) et [Three.js Lighting](https://github.com/CloudAI-X/threejs-skills/blob/main/skills/threejs-lighting/SKILL.md). Réutilisation des objets, animation procédurale indépendante de la fréquence d’image, suspension hors visibilité et coût limité des lumières. Les exemples ne sont pas copiés sans vérification dans Three.js 0.180.0. Ces guides ont été lus comme références pour cette version, sans installation globale. Impeccable reste appliqué aux contrôles et à l’interface.

## Périmètre

La scène est une vraie scène 3D : objets sélectionnables, caméra, positions et animations. Les modèles paramétriques sont définis dans `props.js`, leur assemblage et leurs transformations dans `world.js`. Ce POC n’utilise pas encore Blender ou des fichiers GLB.

Les objectifs et contributions sont fictifs. Le lien vers QuiLivreOù et sa capture sont réels. Aucune vidéo de présentation n’est fournie. QuiLivreOù est un annuaire, pas un transporteur ; le dépôt représente les obstacles à la livraison. Les vraies missions seront choisies au cas par cas. Aucun PostHog, serveur de progression, envoi de message ni publication automatique n’est branché.

## Structure

- `model.js` : compteurs, prérequis, accomplissements, cascade et stockage versionné.
- `world.js` : scène, caméra, marqueurs et transformations selon l’état.
- `ambient.js` : tournée et variations lumineuses déterministes, séparées des acquis.
- `props.js` : modèles de colis, pochettes, palettes, rayonnages et Fenwick.
- `app.js`, `icons.js`, `game-ui.css` : inventaire, indices, commandes et interface de jeu.
- `style.css` : habillage Maco Pocket hérité de la v3.
- `BRIEF.md`, `PRODUCT.md`, `DESIGN.md` : périmètre et système documenté.

Un futur adaptateur serveur devra valider les événements avant de fournir ces mêmes états à la scène. Le stockage de la démo n’est pas une preuve de participation.

## Vérifier et enregistrer

```sh
npm test
npx playwright install chromium
npm run test:browser
npm run test:motion
node record.cjs
```

Le serveur doit tourner pour les tests navigateur et l’enregistrement. `DEMO_URL` permet de choisir une autre adresse. Les rapports et captures sont dans `.impeccable/review/`. Les tests couvrent les compteurs bloqués, la cascade, les missions parallèles, le bonus, la restauration, la caméra, le clavier et la stabilité du device. Formats Chromium : 1280×900, 390×844, 360×740 et 584×1037, avec test de pincement tactile. Téléphone physique et Safari iOS restent à vérifier.

`demo-depot-q-v5.webm` et `demo-depot-q-v5.mp4` enregistrent le prototype en fonctionnement. Le script produit le WebM ; le MP4 est une conversion H.264 avec ffmpeg.

## Assets

Tanker et Space Grotesk sont repris des explorations précédentes. `assets/quilivreou-ui.png` est la capture du site du 11 septembre 2026, reprise de la v2/v3. Les textures de colis, les objets 3D et les icônes sont créés en code pour le prototype.
