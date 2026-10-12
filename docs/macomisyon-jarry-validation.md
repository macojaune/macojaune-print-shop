# Validation locale de Jarry, 12 octobre 2026

## Périmètre

Checkout principal `/Users/marvinl/Documents/DEV/macojaune-web`, branche `develop`, base `a1bc4b70400cea9b48cb63638155964a02a390e7`. Les contrôles ci-dessous ont été réalisés localement avant le commit. Marvin a ensuite confirmé la ressemblance de Jarry et demandé le commit puis le push sur `develop`. Aucun déploiement distant n'entre dans cette validation.

La carte couvre l'emprise approuvée de La Jaille à la pointe et au port. Les [sources géographiques](macomisyon-geography-sources.md) décrivent les instantanés OSM de juillet 2026. Les quatre lieux existants et leurs deux intérieurs sont conservés. Les neuf autres projets ne sont pas implantés dans cette passe.

## Parcours et contrôles exécutés

Serveur de développement vérifié sur `http://127.0.0.1:3096/macomisyon` :

| Contrôle | Résultat | Preuve locale |
| --- | --- | --- |
| `npm run test:macomisyon` | 84/84 | Tests banque et dépôt, après modification de l'échelle bancaire |
| `DEMO_URL=http://127.0.0.1:3096/macomisyon node scripts/verify-macomisyon.mjs` | 10/10 | `.impeccable/review/verification.json` |
| `DEMO_URL=http://127.0.0.1:3096/macomisyon node scripts/verify-memebank.mjs` | 12/12 | `.impeccable/review/bank/report.json` |
| `node scripts/verify-jarry-navigation.mjs` | 11/11 | `.impeccable/review/jarry-navigation/report.json` |
| Revue visuelle indépendante | 9 états contrôlés | `.impeccable/review/jarry-final/report.json` |
| ESLint ciblé et `git diff --check` | Réussis | Fichiers applicatifs modifiés et trois scripts navigateur |

Les 11 contrôles de navigation utilisent de vrais événements tactiles Chromium/CDP à 390 × 844 : glissement sur terrain et depuis un repère, tap, pincement, dézoom, recentrage, absence de chevauchement des cibles, hauteur constante, limites de déplacement, restauration exacte du cadrage après le dépôt et mouvement réduit. Les attentes géométriques ne dépendent ni des anciennes coordonnées ni de l'ancien zoom fixe 3,6.

La revue indépendante examine la vue générale et les rapprochements banque/hangar à 1440 × 1000, 390 × 844 et 740 × 900. Aucun débordement horizontal ni erreur JavaScript détecté. Les centres des repères visibles reçoivent effectivement les événements et les cibles restent de 46 × 46 px. Les deux suites existantes exercent aussi les missions simulées, la persistance, le retour extérieur et le repli sans WebGL.

## Implantation et contrôle du port

Les emprises complètes des quatre bâtiments fictifs ont été comparées aux routes avec les largeurs du renderer, aux surfaces d'eau et à la végétation du JSON. Les coordonnées sont exprimées en unités de scène de 20 mètres. Les marges ci-dessous sont celles du modèle, pas des mesures de terrain.

| Lieu | X / Z | Échelle | Marge avec les routes du modèle |
| --- | --- | --- | --- |
| Banque | −50,11 / −2,98 | 0,55 | 0,258 unité |
| Hangar | 11,87 / 1,88 | 1 | 0,488 unité |
| Maison sur l'eau | 2,07 / 16,78 | 1 | 0,736 unité |
| Atelier | −91,04 / −7,29 | 1 | 0,5 unité |

Les emprises restent à terre, sans recouvrement routier, boisement ou mangrove. Le studio occupe une petite surface herbacée cartographiée. La revue rapprochée confirme que les parvis de la banque et du hangar ne coupent plus leurs voies voisines.

Les deux lots décoratifs de conteneurs ont été retirés après comparaison géométrique : ils empiétaient sur des voies portuaires, et quelques éléments sur l'eau. Les grues sont placées en `[106.9,57.0]` et `[94.7,70.9]` : tous les pieds sont à terre et hors routes/bâtiments. Le bateau reste entièrement sur l'eau. Le littoral n'a pas été déplacé pour accueillir ces accessoires.

## Bundle compilé et limites

Le build `node node_modules/nuxt/bin/nuxt.mjs build` est réussi. Le serveur de développement a été arrêté avant compilation pour éviter de partager ses fichiers générés. Le bundle final a ensuite démarré avec `HOST=127.0.0.1 PORT=3096 node .output/server/index.mjs`.

`DEMO_URL=http://127.0.0.1:3096/macomisyon node scripts/smoke-memebank-production.mjs` passe sur ordinateur et mobile : HTTP 200, palier de curiosité, trois étapes, dépassement des objectifs, scénarios, persistance, commandes et retour à la carte. Aucun accès au debug Vue n'est utilisé pour ce contrôle.

Une dernière revue indépendante du bundle compilé a atteint le port par glissement et neuf clics de zoom. Les huit pieds des grues sont visibles sur les quais, les voies restent libres, les conteneurs décoratifs retirés ne réapparaissent pas et le bateau reste dans l'eau. Aucune erreur JavaScript, requête échouée ou réponse HTTP ≥ 400 dans ces contrôles. Les captures `production-desktop.png`, `production-mobile.png`, `production-port.png` et le rapport `production-network.json` se trouvent dans `.impeccable/review/jarry-final/`. Leur préfixe désigne le bundle compilé **local**, jamais un déploiement distant.

Les deux suites intérieures de 10 et 12 parcours ont été exécutées avant le dernier déplacement des façades. Les 11 contrôles tactiles et les neuf états visuels ont été rejoués après ce déplacement. Le retrait des accessoires portuaires, dernière modification statique, est couvert par le build final, le smoke test compilé et la revue rapprochée du port. Le serveur compilé reste disponible sur le port 3096 pour la revue de Marvin.

Les tests navigateur utilisent Chromium et une émulation tactile, pas un téléphone physique ni Safari/iOS. Marvin a confirmé la ressemblance du quartier après présentation des captures ; la fluidité sur téléphone physique reste à vérifier. Les hauteurs, équipements et couleurs sont stylisés ; les compteurs restent fictifs. Le build Tina n'entre pas dans ce contrôle, ses contenus et sa configuration n'ayant pas changé. Aucun conteneur Docker n'a été créé.
