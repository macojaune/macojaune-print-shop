# Jarry : cube profond et coupe terre/mer

**Essai abandonné à la demande de Marvin.** Le cube, le fond sous-marin et leur cadrage ont été retirés du code. La présentation plate avec relief terrestre est rétablie. Les paragraphes ci-dessous sont un historique des essais rejetés, et ne décrivent plus le rendu courant.

## Reprise du fond sous-marin

Marvin a ensuite rejeté l'extrusion uniforme et l'eau opaque : les petits îlets ressemblaient à des piliers aussi profonds que les grandes terres. La reprise conserve le cadrage en cube, mais relie les rivages par un fond marin continu et progressif, visible à travers l'eau. Les coupes terrestres du périmètre restent pleines jusqu'au fond. Les faces marines du périmètre se répartissent entre eau au-dessus du fond marin local et roche en dessous.

Ce fond est une interprétation graphique déterministe construite à partir des côtes OSM. Il ne représente aucune bathymétrie mesurée. Les altitudes terrestres IGN et les limites OSM restent indépendantes de ce modelage. Les tons sableux des hauts-fonds passent au bleu-vert en profondeur ; les matériaux d'eau sont translucides, sans simulation de réfraction.

Les crédits cartographiques quittent l'affichage permanent. Ils sont présentés à l'ouverture puis restent accessibles dans « À propos ». Les [règles d'attribution OSMF pour les cartes interactives](https://osmfoundation.org/wiki/Licence/Attribution_Guidelines#Interactive_maps) autorisent le repli automatique après au moins cinq secondes avec un accès durable aux informations de licence. La simple suppression des crédits n'est pas l'objectif.

Le fond comporte 29 151 triangles, avec des arêtes horizontales de moins de 10 unités. Le volume comporte 58 709 triangles au total avant les reflets de surface. Le profil final comprend un plateau côtier peu profond et des ondulations larges ; il s'étend de −74,16 à −1,50 unités de scène. Ces valeurs graphiques ne sont pas des mètres de bathymétrie. Les normales du maillage soudé sont lissées pour éviter de rendre visibles les fines bandes du découpage OSM. Quelques reflets discrets matérialisent la surface horizontale, sans animation supplémentaire.

Les 110 tests de Maco’misyon passent, dont 14 contrôles de volume : empreinte de mer conservée, maillage continu, raccords Float32 exacts avec les lèvres et les coupes, îlets sans piliers isolés et régression du trou sur l'îlet avant. ESLint et `git diff --check` passent. Les crédits ont été vérifiés dans Chromium sur ordinateur, 390 px et 320 px : chargement retardé, visibilité au moins cinq secondes, repli, maintien au focus, liens de licence, panneau défilant et retour du focus après fermeture. Les quatre lieux et les noms de rues passent également sur le serveur de développement. Les vérifications de cette reprise sont à distinguer de celles de la version opaque documentée ci-dessous.

Le build Nuxt final de cette reprise est réussi et servi sur `http://127.0.0.1:3096/macomisyon` (HTTP 200). Le module `Xf85PshA.js` servi correspond au build local, SHA-256 `b7af27b18acc0dc736518a1333586dd9a5327d467d1339b55870541ca4c62396`. Les scripts `verify-jarry-relief.mjs`, `verify-jarry-credits.mjs` et `smoke-memebank-production.mjs` passent sur ce runtime compilé : carte et quatre lieux, sources et clavier, banque et retour au monde. Aucune erreur JavaScript ni d'hydratation relevée. Les captures et le rapport de carte sont dans `.impeccable/review/jarry-underwater/`, les contrôles des crédits dans `.impeccable/review/jarry-credits-final/`. Les vues finales ordinateur/mobile ont été inspectées. Le mobile reste émulé ; aucun essai sur téléphone physique n'est revendiqué. Le travail reste local, non commité et non poussé.

## Première version : cube opaque

Le 22 octobre 2026, Marvin a choisi le cube profond parmi les esquisses. Sa correction porte sur les tranches terrestres : toute terre coupée par l'emprise, notamment du côté de Pointe-à-Pitre, doit descendre jusqu'au fond du bloc. Une bande bleue sous cette terre donnerait l'impression qu'elle flotte sur la mer.

## Géométrie

`jarry-diorama.js` construit le volume à partir des terres OSM existantes : surface de mer limitée à l'emprise, parois terrestres, parois d'eau sur les seules portions marines du périmètre, fond commun et raccords côtiers. Les terres conservent leurs contours, trous et îlets. Les arêtes de leur coupe suivent le même sampler triangulaire IGN que le dessus ; les petites altitudes négatives restent masquées par la terre, sans inondation artificielle. Lorsqu'un rivage est sous le niveau de la mer, une petite face d'eau ferme le raccord sans relever le terrain. Cette face n'est jamais ajoutée sur les coupes terrestres du périmètre.

La limite inférieure vaut `-95` unités de scène. **Cette épaisseur est un choix graphique, pas une altitude géologique ou une profondeur marine mesurée.** Les faces opaques colorées ne prétendent pas décrire les fonds ni les strates réelles. Les données OSM et IGN du dessus ne sont pas modifiées ; leur provenance et leurs limites sont décrites dans [le document relief](macomisyon-jarry-relief.md).

La coupe partitionne chaque côté entre terre et eau ; elle évite les faces bleues superposées aux parois terrestres. La construction par bandes traite aussi les îles, trous, chevauchements et contacts avec les coins. Les raccords de la surface d'eau sont subdivisés après conversion Float32 afin d'éviter les microfissures entre triangles rendus par le GPU. Seules les coordonnées correspondant au plan de coupe peuvent être alignées sur celui-ci, dans la tolérance de l'arrondi OSM de 5,1 mm.

Le volume ajoute 4 972 triangles de mer, 21 174 de roche, 1 434 de parois d'eau, 320 de raccords côtiers et 2 au fond. Les matériaux sont opaques, avec un dégradé vertical discret. Une ombre douce et le fond sauge distinguent l'objet du fond de l'interface.

## Cadrage et navigation

`jarry-framing.js` projette les huit coins du volume complet et réserve de l'espace pour le titre et les commandes. Le cube est centré sur sa hauteur en vue générale. La sélection d'un lieu vise ensuite sa hauteur d'assise réelle. Le déplacement conserve la hauteur de la vue courante ; le recentrage retrouve le cube et le retour d'un intérieur restaure la vue mémorisée.

Les marges restent exprimées en pixels pendant le zoom, pour ne pas repousser la cible hors écran. Sur téléphone, le cube entier reste visible et les repères conservent leur taille tactile. Leur filtrage en cas de chevauchement et la liste des lieux existante restent actifs.

## Vérification

La suite `npm run test:macomisyon` passe avec **106 tests**, dont 10 pour le volume et 2 pour son cadrage. Les tests de volume vérifient les quatre côtés, l'absence de double paroi, les normales, les altitudes négatives, l'emprise de la mer, les raccords et le déterminisme. Une régression utilise un rayon à l'emplacement réel du raccord côtier ouvert trouvé en revue. Les tests de cadrage couvrent six formats et le maintien des marges pendant le zoom.

La navigation tactile passe ses **11 contrôles** sur le serveur de développement : sélection, pincement, déplacement sans dérive de hauteur, zoom, recentrage, restauration de la vue après le dépôt, limites et mouvement réduit. Le premier passage du pincement a échoué pendant les modifications ; le contrôle isolé puis la suite complète, sur fichiers figés, passent.

Les captures et contrôles navigateur de cette étape sont conservés dans `.impeccable/review/jarry-diorama/`, séparément des captures de la précédente intégration du relief. Le script `verify-jarry-relief.mjs` accepte désormais `REVIEW_DIR` pour choisir ce dossier sans écraser la référence précédente.

Le build Nuxt final réussit. Le serveur compilé est démarré à `http://127.0.0.1:3096/macomisyon` et répond HTTP 200. Le module servi `Dmb6Tb1K.js` est identique au fichier du build (SHA-256 `7e6c70d982e5fc74e7b32f2170e037c4b07fc21be4b889667ac6a83ef19722a2`). Sur ce serveur, `verify-jarry-relief.mjs` passe pour les vues générales et les quatre lieux en 1440 × 1000 et 390 × 844 : aucune erreur JavaScript, aucun débordement, aucun appel géographique externe. Les captures finales du dossier ci-dessus proviennent de ce build et ont été inspectées visuellement.

`smoke-memebank-production.mjs`, exécuté contre ce même serveur **local**, passe également sur ordinateur et mobile : entrée, étapes et scénarios de la banque, commandes de zoom et retour à la carte, sans erreur JavaScript ni hydratation. Le nom du script ne désigne pas un déploiement en production. Ces vérifications utilisent Chromium avec mobile émulé ; elles ne constituent pas un essai sur téléphone physique.

Travail local sur `feat/jarry-relief`, sans commit, push ni déploiement distant. La validation visuelle humaine de cette intégration reste à faire.
