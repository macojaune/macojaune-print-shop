# Le dépôt Q · POC v3

Entrepôt miniature de QuiLivreOù dans Maco’misyon. Cette version isolée conserve les prototypes précédents dans `../prototype-plateau/`.

## Ouvrir

Depuis ce dossier, avec Node.js 20+ et Python 3 :

```sh
npm ci --ignore-scripts
npm start
```

Ouvrir http://127.0.0.1:58014/. Aucun compte, secret ou service distant n’est nécessaire à la démo.

## Explorer

Glisser pour déplacer la vue, pincer ou utiliser les boutons pour zoomer. Toucher le Fenwick Q ouvre la présentation de QuiLivreOù ; les points et le bouton « Les missions » donnent accès aux mêmes étapes.

Trois missions principales simulées rétablissent l’alimentation, l’hydraulique et le fonctionnement du Fenwick. Le bonus de destinations enrichit le décor indépendamment. Lorsqu’un objectif est atteint, le panneau se ferme pour montrer la transformation du dépôt.

« Mode démo » compare les états à l’arrêt, en réparation, réparé et bonus seul. Les commandes remplacent délibérément l’avancement de démonstration. Celui-ci reste dans le stockage local du navigateur lorsque disponible ; en cas d’indisponibilité, la démo fonctionne pour la session. Revenir après réparation ne rejoue pas la célébration.

## Ce qui est réel et ce qui est simulé

La scène est constituée d’objets 3D, avec sélection, caméra et transformations. Les objets de `props.js` sont des modèles paramétriques éditables, assemblés dans `world.js`. Ce POC n’utilise pas encore de fichiers Blender/GLB. La capture du site et son lien sont réels. La vidéo de présentation n’est pas fournie et reste désactivée.

Tous les objectifs et participations sont fictifs. Aucun clic n’inscrit quelqu’un, ne publie une vidéo ou ne modifie le vrai site. Les missions réelles et leurs rôles seront choisis au cas par cas. QuiLivreOù est un annuaire de boutiques, pas une société de livraison ; la panne du véhicule est une métaphore du jeu.

## Structure

- `model.js` : définition des missions, dépendances, événements de contribution, réparation acquise et stockage local versionné.
- `props.js` : bibliothèque 3D réutilisable de colis, pochettes, rayonnages, palettes et véhicule.
- `world.js` : scène, projection des points, exploration et effets visuels de l’état collectif.
- `app.js` : panneaux, actions, annonces, commandes de démonstration et clavier.
- `BRIEF.md` : périmètre validé ; `DESIGN.md` : système observé après relecture.

Pour connecter de vraies participations, l’état doit être validé et conservé côté serveur. Le stockage de cette démo n’est pas une preuve de participation. Un futur adaptateur pourra fournir les mêmes états à la scène.

## Vérifier

```sh
npm test
npx playwright install chromium
npm run test:browser
```

Le serveur doit être actif pour les tests navigateur. `DEMO_URL` permet d’en choisir un autre. Rapports et captures se trouvent dans `.impeccable/review/`. Les tests couvrent les dépendances, les doublons d’événements, la réparation, le bonus indépendant, la restauration, les gestes et la stabilité du device. Les captures utilisent Chromium ; téléphone physique et Safari iOS restent à vérifier.

## Sources des assets

Tanker et Space Grotesk proviennent des assets locaux déjà employés sur les planches et la v2. `assets/quilivreou-ui.png` est la capture du site QuiLivreOù faite le 11 septembre 2026, copiée depuis la v2. Les étiquettes sur les colis sont dessinées sur des textures Canvas dans `props.js`. Les modèles 3D du dépôt sont créés pour ce POC.

## Résultat de la relecture

POC local validé après deux corrections ciblées : titre de réussite sur petit écran et marqueurs d’état visibles sans couleur. Les fines stries du sol restent un détail de rendu à améliorer. Les captures de correction finale sont `small-repaired.png` et `mobile-progress.png` ; le rapport complet est `.impeccable/review/review.md`.

`demo-depot-q.mp4` et `demo-depot-q.webm` montrent cette version fonctionnelle. `node record.cjs` refait une capture mobile du parcours ; `ffmpeg` permet ensuite de convertir le WebM en MP4.
