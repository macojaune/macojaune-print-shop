# Maco’misyon — prototype de territoires (v2)

Preuve interactive locale, sans connexion aux services des projets, publication ni données réelles.

## Ouvrir

Depuis ce dossier : `python3 -m http.server 58012 --bind 127.0.0.1`, puis http://127.0.0.1:58012.

Three.js 0.180.0 est installé localement et chargé en module ES. Si node_modules manque : `npm install --ignore-scripts`.

La première version est conservée dans `v1/`, accessible sur http://127.0.0.1:58012/v1/.

## Essayer

1. Choisir QuiLivreOù ou Shootareas sur la carte : un panneau présente le projet, sa vraie interface et son site.
2. Explorer son territoire, déplacer la carte en glissant et zoomer avec les boutons, la molette ou deux doigts.
3. Ouvrir une mission : son compteur, son état et ses conditions sont expliqués. Consulter une étape ne l’accomplit pas.
4. Sur QuiLivreOù, simuler trois inscriptions : le compteur passe de 7 à 10, affiche « Objectif atteint » et ouvre les premiers retours.
5. La recherche de partenaire suit une branche indépendante. Shootareas possède ses propres objectifs et compteurs.
6. « La carte » revient à la vue d’ensemble ; le carnet permet aussi d’accéder aux projets. Réinitialiser remet les compteurs à leur état initial.

## Ce que cette version démontre

Deux territoires continus avec plusieurs points et chemins, des décors distincts, une caméra déplaçable et des pions animés. Le device et son écran gardent leurs dimensions ; les panneaux défilent à l’intérieur de l’écran. Navigation au clavier, confinement du focus dans les panneaux et mouvement réduit sont pris en compte.

`data.js` porte les projets et dépendances fictives ; `world.js` la scène Three.js et la caméra ; `app.js` les panneaux et interactions. Rendu à la demande, sans boucle permanente au repos, pixel ratio plafonné à 1,7.

## Limites

Objectifs, compteurs, chemins et dépendances sont des exemples à définir avec Marvin. L’avancement disparaît au rechargement. Aucun PostHog, compte utilisateur, stockage partagé ni publication automatique. Les vraies vidéos de présentation ne sont pas fournies : « Vidéo à venir » reste désactivé. Les captures et liens des sites sont réels.

La coque est en CSS et le plateau en WebGL. Ce n’est pas une carte précise de Guadeloupe ni une intégration de Terraink. Les performances sur téléphone physique et Safari iOS restent à vérifier.

## Vérification v2

- `node verify-v2.cjs` : Chromium 1280×800, 390×844 et 360×740 ; stabilité du device avant/après parcours, états et branches, présentations, zoom/déplacement, clavier, mouvement réduit et absence d’erreurs JavaScript.
- `node verify-gestures-v2.cjs` : pincement tactile émulé, confinement du focus dans les deux sens et progression d’une branche indépendante.
- Rapports `v2-tests.json`, `v2-gestures.json` et captures `v2-*.png` dans `.impeccable/review/`.
- Relecture indépendante finale : corrections validées du débordement de 17 pixels, du contraste du focus et du titre répété. Accepté à l’échelle du prototype local.
- Détecteur Impeccable exécuté en mode dégradé faute de modules de parsing ; ombre du bouton physique examinée et conservée intentionnellement. Ce contrôle ne constitue pas un audit complet d’accessibilité.

Les scripts `verify.cjs`, `verify-touch.cjs`, `record.cjs` et les vidéos `demo-mobile.*` correspondent à la v1 ; ils ne représentent pas cette version.

## Archive Git portable

Voir [le guide de reprise](../README.md). Dans cette archive, les scripts historiques v1 ciblent `/v1/`, et tous les tests utilisent la dépendance Playwright locale. `DEMO_URL` permet de changer le serveur. Le seul ajustement du code v1 est son import Three.js vers `../node_modules/`, pour partager les dépendances avec la v2 sans lien symbolique vers un dossier ignoré.
