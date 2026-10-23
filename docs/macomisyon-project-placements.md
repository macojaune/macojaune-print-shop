# Lieux supplémentaires de Maco’misyon

État local du 23 octobre 2026, sur `feat/jarry-relief`, à partir de `fbe7a2b`. Les lieux sont des scénographies de projets ; leur implantation ne désigne pas les occupants réels des bâtiments OSM. La présentation plate, le relief terrestre, les rues et la végétation sont conservés.

## Implantations intégrées

| Projet | Implantation dans la scène (X, Z) | Représentation et accès |
| --- | --- | --- |
| Kòkòlò | `63.5, 77` | Voiture sauge et crème, garée à l’écart dans la zone libre indiquée par Marvin. Aucun bâtiment supprimé. Le repère apparaît seulement à la sélection ; la voiture et la liste permettent de la sélectionner. Pas de mission ni d’intérieur. |
| O Mas La | `92.2, -64.6` | Local avec cour de 20 × 16 m, entre Léonille Chéry et Emmanuel Gorial, au-dessus du bassin montré par Marvin. Tambours, costumes et fanions statiques. Aucun bâtiment supprimé. Fiche de découverte ; pas d’intérieur ni d’activation saisonnière. |
| MAGGMA Studio | `45.328375, 17.117870` | Volcan compact remplaçant uniquement le petit bâtiment en U `way/131121970/0`. Fiche avec lien vers le site du studio. |

Le local de mas avec cour a été validé, puis déplacé à la demande de Marvin vers la zone du local VIM montrée sur sa capture. L’îlot est identifié avec confiance ; l’adresse exacte du groupe n’est pas établie. La scène fictive O Mas La ne représente pas un partenariat avec VIM. Rotation Y : `1.147` rad. L’enveloppe reste à 7,57 m du bâtiment voisin et 4,47 m de la chaussée selon les gabarits du rendu.

Les nouveaux lieux utilisent `jarry-landmark-sites.js`, distinct des quatre grands socles de projets historiques. Le modèle de voiture est à l’échelle du fond géographique : environ 4,6 × 1,9 m. Sa pose tient compte de la surface industrielle visible, au-dessus du MNT. Les fondations des bâtiments descendent jusqu’au relief sans le remodeler. Leurs ressources Three.js sont libérées par `createJarryLandmarks().dispose()`.

## MAGGMA Studio : petit bâtiment en U

Marvin a retenu le petit U immédiatement au-dessus des premiers candidats A/B. Le volcan remplace uniquement `way/131121970/0`, au centre `x: 45.328375, z: 17.117870`, rotation Y `−0.0862610221`. Les deux premiers candidats restent rendus.

Le modèle mesure 8 × 12,8 m, pour 9 m de haut. Sa base exacte à douze sommets tient entièrement dans l’aile ouest du bâtiment, avec une marge minimale de 0,58 m dans le contour OSM. Sa fondation suit le terrain. La scène est une interprétation du studio, pas un relief volcanique réel.

La fiche contient un lien explicite vers `https://maggma.studio/`, ouvert dans un nouvel onglet ; la sélection du volcan seule ne navigue pas. Le remplacement passe par `replaceBuildings`, distinct des réservations historiques de 120 m autour des quatre premiers projets.

## Aménagements routiers du 23 octobre 2026

Deux décors non interactifs reprennent les observations et captures de Marvin. Ils ne constituent pas une information de circulation en temps réel et ne modifient pas les tracés OSM.

- Giratoire Route de l’Alliance : rangée de barrières rouges et crème sur l’arc vers 7 heures, `x: -33.758, z: -81.3195`, rotation `-1.51116561366`. Elle coupe le tronçon en travaux `way/1005580704/0` sans barrer la sortie voisine. La rangée mesure 10 m de large et 1 m de haut.
- Voie Verte André Gunot : gravats recouverts de bâches blanches au milieu de la mangrove, `x: -34.40475, z: -53.75025`, rotation `-0.15419425585`, sur `way/231852331/0`. L’enveloppe mesure 10 × 7 m et son sommet atteint 4 m au-dessus de la route. Sa largeur couvre les 7,6 m de chaussée représentés ; cette largeur routière est une convention du rendu, pas un relevé de terrain.

Les volumes suivent le MNT et l’élévation de la route rendue. Leurs bases descendent jusqu’au terrain sur les accotements pour éviter une suspension aux bords. Le module `jarry-roadworks.js` possède et libère ses ressources ; il n’ajoute ni repère, ni fiche, ni mission.

## Autres implantations à discuter

Ces sept emplacements restent des propositions ; aucun modèle ni accès applicatif correspondant n’a été ajouté.

| Projet | Scène proposée | Voisinage |
| --- | --- | --- |
| #StayConnect | Petit disquaire à Jarry, dans le secteur SACEM / Les Tropiques proposé par Marvin | Candidat `way/131124535/0`, près de la rue Henri Becquerel ; deux points d’annuaire distants de 254 m, occupation SACEM non confirmée. |
| ProblemBox | Local d’écoute et répondeur | Rue Eugène Freyssinet, près des bureaux du studio. |
| Chat mange quoi ? | Boutique avec chat, gamelle et carnet | Rue Jacques Portecop, près de l’atelier Zikak. |
| MémoireHub | Bibliothèque et reprographie | Passage des Sargasses, près de MemeBank. |
| Friendli.st | Bureau d’accueil et meuble à fiches | Rue Hubert Jasor. |
| Date Assistant | Conciergerie et terrasse en toiture | Près de la rue de la Chapelle, tournée vers la rive sud. |
| Convoyage | Comptoir de remise des clés et deux places | Desserte proche du boulevard de la Pointe de Jarry. |

Les enveloppes proposées tiennent dans les empreintes OSM retenues, hors routes, eau, végétation et voisins. Les vues 3D et les fondations restent à vérifier lors de leur éventuelle intégration. Les recherches et la carte de discussion sont conservées dans `.impeccable/review/macomisyon-projects-brainstorm-20261022/` ; ce dossier de travail est ignoré par Git.

## Validation de l’intégration

- Suite Macomisyon après les déplacements : 101 tests réussis, incluant cinq contrôles géométriques des nouveaux lieux et deux contrôles de leurs fiches. La régression MAGGMA préserve les candidats A/B et vérifie la base entière dans le petit U retenu.
- ESLint ciblé et `git diff --check` réussis.
- Revue indépendante : les quatre pneus dégagent de 4 cm le maillage industriel réellement rendu ; l’ancien calcul reproduit un enfouissement de 8 cm. La correction relève la voiture sans changer la géométrie du terrain.
- `node scripts/verify-jarry-landmarks.mjs` : liste, focus clavier, absence de fausse mission, accès au studio, retour du dépôt, écrans de 1440, 390 et 320 px, repli sans WebGL. Sur ordinateur, glissement depuis les modèles puis clic sur le canvas pour les sélectionner et les recentrer.
- Captures finales du volcan dans le petit U et de la cour du mas déplacée inspectées sur ordinateur et mobile, dans `.impeccable/review/jarry-placements-final-20261023/`. Les modèles, leurs repères et les fiches sont visibles ; le clic sur chacun des trois modèles et leur recentrage ont été vérifiés sur ordinateur. Ce sont des émulations Chromium, pas une recette sur téléphone physique.
- Build Nuxt/Nitro réussi (`node node_modules/nuxt/bin/nuxt.mjs build`), puis parcours navigateur réussi sur le serveur compilé `http://127.0.0.1:3096/macomisyon`, aux trois largeurs et sans WebGL. Le paquet `CUC5JzYL.js` servi en HTTP 200 est identique au fichier compilé, SHA-256 `88ab449d385e2bbc41820b5b53bc4ade45d5c84a8e856cf4fa1dcdb954d98a1c`. Rapports, captures et empreinte dans `.impeccable/review/jarry-placements-final-20261023/`. Le CMS inchangé n’a pas été reconstruit. Les avertissements du build concernent Browserslist, les sourcemaps et la taille des paquets.

Livraison à ce stade : modifications locales non commitées, serveur compilé local laissé en route. Aucun push, merge ni déploiement distant.

Le navigateur intégré a échoué deux fois à la capture avec `Preview automation snapshot timed out after 15000ms.` ; le contrôle visuel utilise donc le navigateur Playwright du dépôt. Les tests et le serveur local emploient Node 22.15.0, compatible avec l’extension SQLite déjà installée. La déclaration `engines: 20.x` du projet n’a pas été modifiée ; aucune reconstruction des dépendances ni image Docker n’a été effectuée pour ce travail.

### Contrôle consolidé avant envoi sur develop — 23 octobre 2026

La fiche de lieu remplace le bandeau inférieur : fenêtre à droite sur grand écran, fenêtre basse sur mobile, titre focalisé à l'ouverture, fermeture par croix ou Échap avec restitution du focus. Les commandes de carte conservent leur position à l'extrême droite pendant la sélection, y compris en paysage court. L'exception à l'anonymat extérieur de MAGGMA Studio est désormais indiquée dans `PRODUCT.md` et `DESIGN.md`.

- 115 tests JavaScript Macomisyon, 14 tests Python des importeurs, ESLint ciblé et `git diff --check` réussis.
- `verify-jarry-place-panel.mjs` réussi sur 1440 × 1000, 390 × 844, 320 × 740, 820 × 900 et 844 × 500 : position inchangée des commandes, absence de recouvrement, sélection, clavier, retour du dépôt, banque sur ordinateur/mobile, lien externe et lieu sans mission. Aucune erreur JavaScript relevée.
- Barrières et gravats contrôlés par calcul sur les rubans routiers puis examinés dans le serveur compilé, après navigation par glissement et boutons de zoom. Chaque barrage intersecte uniquement la route ciblée ; la hauteur de 4 m et la libération des ressources ont été vérifiées.
- Build Nuxt/Nitro réussi ; paquet servi `kFIkPCqz.js` identique au fichier compilé, SHA-256 `841f30a1b31196e33e7199f833fd8811aa906d64644388b5fdf888923c11c41a`. Captures, rapport des cinq formats et preuve HTTP dans `.impeccable/review/jarry-controls-roadworks-20261023/` (ignoré par Git).

Ces contrôles portent sur l'application locale compilée, pas sur un déploiement distant ni un téléphone physique. Le push demandé vise la branche Git `develop`.
