# Le dépôt Q · POC v4

Entrepôt miniature de QuiLivreOù dans Maco’misyon. La v3 reste intacte dans `../prototype-warehouse/`.

## Ouvrir

Avec Node.js 20+ et Python 3 :

```sh
npm ci --ignore-scripts
npm start
```

Ouvrir http://127.0.0.1:58015/. Aucun compte ni secret nécessaire.

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

Les effets ne se rejouent pas au rechargement. La v4 utilise son propre stockage local, sans toucher à la v3. Si le stockage est indisponible, elle reste utilisable pour la session. Les gestes et les animations respectent la préférence de mouvement réduit.

## Périmètre

La scène est une vraie scène 3D : objets sélectionnables, caméra, positions et animations. Les modèles paramétriques sont définis dans `props.js`, leur assemblage et leurs transformations dans `world.js`. Ce POC n’utilise pas encore Blender ou des fichiers GLB.

Les objectifs et contributions sont fictifs. Le lien vers QuiLivreOù et sa capture sont réels. Aucune vidéo de présentation n’est fournie. QuiLivreOù est un annuaire, pas un transporteur ; le dépôt représente les obstacles à la livraison. Les vraies missions seront choisies au cas par cas. Aucun PostHog, serveur de progression, envoi de message ni publication automatique n’est branché.

## Structure

- `model.js` : compteurs, prérequis, accomplissements, cascade et stockage versionné.
- `world.js` : scène, caméra, marqueurs et transformations selon l’état.
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
node record.cjs
```

Le serveur doit tourner pour les tests navigateur et l’enregistrement. `DEMO_URL` permet de choisir une autre adresse. Les rapports et captures sont dans `.impeccable/review/`. Les tests couvrent les compteurs bloqués, la cascade, les missions parallèles, le bonus, la restauration, la caméra, le clavier et la stabilité du device. Formats Chromium : 1280×900, 390×844, 360×740 et 584×1037, avec test de pincement tactile. Téléphone physique et Safari iOS restent à vérifier.

`demo-depot-q-v4.webm` et `demo-depot-q-v4.mp4` enregistrent le prototype en fonctionnement. Le script produit le WebM ; le MP4 est une conversion H.264 avec ffmpeg.

## Assets

Tanker et Space Grotesk sont repris des explorations précédentes. `assets/quilivreou-ui.png` est la capture du site du 11 septembre 2026, reprise de la v2/v3. Les textures de colis, les objets 3D et les icônes sont créés en code pour le prototype.
