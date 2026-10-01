# Maco'misyon dans Nuxt

L’intégration se trouve à `/macomisyon`. Elle rassemble la carte extérieure, le Dépôt Q de QuiLivreOù et la banque de Memebank. C’est une démo locale à compteurs fictifs, sans connexion aux comptes utilisateurs, aux événements des produits, à Zikak ou aux publications sociales.

## Document de référence

Le lien Drive est déjà connu : [Maco’misyon · Synthèse fondatrice](https://drive.google.com/file/d/1JGOO_S5Ht72q_g-UE3ZMAHN6rTAYkUq6/view). La section 25 décrit Memebank ; elle a été relue le 1 octobre 2026 via l’accès Drive local existant. Si le lien web demande une connexion, cela ne signifie pas que l’URL manque. Le [brainstorming et storyboard de la banque](macomisyon-banque-concept.md) distingue la source, les choix confirmés et les valeurs illustratives.

## Reprendre ici

Le travail se fait directement sur `develop` dans `macojaune-web`, selon le choix de Marvin. Les prototypes antérieurs restent dans `explorations/macomisyon` et le dossier voisin `macomisyon-archive`. Le worktree temporaire `macojaune-macomisyon` a été supprimé après transfert de ses deux documents de préparation.

Le dossier préexistant `.letta/worktrees/macotidien-episode-16` appartient à un ancien travail Letta. Il contient un brouillon d'article non suivi. Il reste conservé et exclu localement du dépôt parent.

## Versions conservées

Chaque étape a son commit et son tag Git. Les dix premiers repères, de `macomisyon/01-cadrage` à `macomisyon/10-depot-q-v6`, gardent les explorations antérieures.

| Repère Git | Étape |
| --- | --- |
| `macomisyon/11-nuxt-jarry-v1` | Première intégration Nuxt, îlot initial avec noms visibles. Commit `ba7a2d2`. |
| `macomisyon/12-monde-littoral-v2` | Géographie reconstruite à partir des deux captures aériennes, murets à 7 h, lieux anonymes et révélation du projet à l'intérieur. |

Pour comparer une étape sans changer la branche de travail : `git show <repère>:<fichier>` ou `git diff <ancien-repère> <nouveau-repère>`. Les [captures de chaque version](macomisyon/versions/README.md) sont aussi conservées dans Git. Les captures de vérification locales sous `.impeccable/review` peuvent être régénérées.

## Parcours

1. Arrivée dans un monde isométrique sans nom, dont le littoral et les grands axes suivent les références aériennes de Jarry.
2. Déplacement et zoom avec le toucher, la souris ou le clavier. La liste des lieux donne le même accès sans sélectionner un objet 3D.
3. Sélection d’un pictogramme et indice sur le lieu. Le hangar révèle QuiLivreOù ; la banque révèle Memebank après son palier de curiosité simulé.
4. Exploration des Komisyon, de leurs indices et des scénarios de démonstration.
5. Retour à la carte sans perdre le cadrage précédent.

L'intérieur est adressable par `/macomisyon?lieu=depot-q`. Le bouton Retour au monde et l'historique du navigateur permettent de changer de scène. La carte reste montée mais suspend son rendu quand le dépôt est affiché. Les scènes respectent la réduction de mouvement du système et le bouton Pause. Leurs rendus, contrôles et ressources GPU sont libérés en quittant la route.

## Où modifier quoi

| Fichier | Rôle |
| --- | --- |
| `app/pages/macomisyon/index.vue` | Cadre de jeu, navigation entre les scènes, commandes et accès textuel |
| `app/components/macomisyon/JarryMap.client.vue` | Montage de la carte, étiquettes et préférences |
| `app/lib/macomisyon/jarry-world.js` | Géographie du monde, caméra, sélection et mouvements |
| `app/lib/macomisyon/places.js` | Noms fictifs des lieux et indices extérieurs, sans dévoiler les projets |
| `app/components/macomisyon/DepotQ.client.vue` | Interface Vue du dépôt et console de démonstration |
| `app/lib/macomisyon/depot/world.js` | Entrepôt et transformations visuelles issus de la v6 |
| `app/lib/macomisyon/depot/props.js` | Objets procéduraux : Fenwick, cartons, rayonnages |
| `app/lib/macomisyon/depot/model.js` | Compteurs distincts, dépendances et sauvegarde locale |
| `app/lib/macomisyon/depot/ambient.js` | Horloges, signaux et tournée du Fenwick |
| `app/components/macomisyon/MemeBank.client.vue` | Trois points d’étapes, panneaux cohérents avec le hangar et simulations |
| `app/assets/css/macomisyon-interior.css` | Styles communs des docks, fiches, jauges et carnets du hangar et de la banque |
| `app/lib/macomisyon/bank/model.js` | Curiosité, newsletter, dossiers, qualification, invitations et ouverture explicite |
| `app/lib/macomisyon/bank/exterior.js` | Façade à colonnes, rideau et conséquences sur la map |
| `app/lib/macomisyon/bank/world.js` | Grand intérieur en coupe, employés, clients, files, courrier, dossiers et coffre VHS animé |
| `app/lib/macomisyon/bank/progression.js` | Volume des piles et dépassements logarithmiques indépendants des quotas |

Le rendu Three.js reçoit un état. Les règles de contribution restent dans le modèle, sans dépendre de la scène. Cette séparation permettra de remplacer la sauvegarde locale par un état issu du serveur.

## Ce qui est illustratif

Les positions des projets et les volumes de Jarry sont simplifiés. Le rond-point de référence est celui indiqué par Marvin, à `16.2548421057647, -61.57080966792664`. La carte ne sert pas au guidage géographique.

Les objectifs, la dépendance entre les boutiques et les avis, ainsi que le bonus sont des valeurs de démonstration. Les trois compteurs principaux sont les inscriptions, les nouveaux sites et les nouveaux avis. La création d'un site avec sa première expérience n'incrémente pas aussi le compteur des avis. Une mission verrouillée garde ses contributions ; elle se valide quand son prérequis est rempli. Le Fenwick ne repart qu'après les trois missions principales. Les dépassements restent visibles.

La page porte `noindex` et affiche son statut de démonstration. Cela ne constitue pas une protection d'accès : elle ne contient aucune donnée privée. Elle n'est pas encore ajoutée à la navigation publique du site.

## Prochaine livraison

- Remplacer les scénarios par un état de monde lu depuis le serveur.
- Définir les premiers quotas réels avec Marvin et le point de départ des compteurs.
- Construire le tableau de commande pour changer missions, dépendances et contenus sans redéploiement.
- Recevoir les événements de QuiLivreOù avec des identifiants stables et éviter les doubles incréments.
- Préparer les notifications et contenus avant d'activer leurs déclencheurs.
- Raccorder Zikak avec simulation et attribution volontaire des règles rétroactives.

## Lancer et vérifier

Utiliser la version Node du projet indiquée dans `.nvmrc`, puis installer les dépendances avec Bun, qui maintient `bun.lock`.

```sh
bun install --frozen-lockfile
node node_modules/nuxt/bin/nuxt.mjs dev --host 127.0.0.1 --port 3000 --dotenv .env
node --experimental-default-type=module --test app/lib/macomisyon/depot/*.test.mjs app/lib/macomisyon/bank/*.test.mjs
node scripts/verify-macomisyon.mjs
node scripts/verify-memebank.mjs
```

Le lancement Nuxt direct permet de vérifier Maco'misyon sans régénérer l'inventaire des images ni démarrer l'éditeur Tina. Le script habituel `npm run dev` conserve sa fonction complète pour le reste du site.

Le script navigateur requiert Chromium installé par Playwright, avec `bunx playwright install chromium` si nécessaire. Il vérifie le passage entre les scènes, les règles dans l'interface, la sauvegarde, la pause, le retour au cadrage précédent, la réduction de mouvement et l'absence ou la perte de WebGL. Il produit un rapport et des captures bureau et mobile sous `.impeccable/review`, dossier généré exclu de Git. `DEMO_URL` permet de choisir un autre serveur.

La validation mobile utilise un navigateur émulé. Les performances sur un téléphone physique restent à mesurer avant une mise en ligne publique.

### Validation du 18 septembre 2026

- 11 tests du modèle et des animations réussis ; lint des fichiers ajoutés et contrôle des différences réussis.
- 10 parcours navigateur réussis, dont les compteurs verrouillés, la réparation, la sauvegarde, le retour caméra, le mobile et les solutions de repli WebGL.
- Compilation Nuxt réussie avec Node 22.15.0. Le serveur compilé a aussi été vérifié : carte, entrée au dépôt, quatre Komisyon et retour, sans erreur JavaScript ni erreur d'hydratation détectée.
- Revue visuelle indépendante des sept captures : aucun défaut bloquant pour cette première démo. Les animations ont été vérifiées par les parcours navigateur ; la revue indépendante portait sur les captures et le code.

Cette validation concerne l'intégration de démonstration. Elle ne valide ni des compteurs réels ni un déploiement distant. Le build complet Tina n'a pas été exécuté ; les contenus et sa configuration n'ont pas changé.

### Reprise géographique, version 12

Les dix parcours navigateur ont été rejoués après la reconstruction du monde et le changement du parcours de découverte. Ils contrôlent aussi l'absence des noms de projets et de lieux réels dans la vue extérieure, ses libellés accessibles et son titre. Le projet apparaît une fois le hangar ouvert.

La revue indépendante a comparé les vues bureau, mobile et le détail du giratoire aux deux références aériennes. Elle a demandé de dégager la végétation qui cachait une bretelle. Après correction et nouvelles captures, ce point a été jugé résolu. Les trois vues finales ont aussi été contrôlées sans débordement horizontal ni erreur JavaScript capturée. Sur mobile, la vue d'ensemble montre toute la péninsule ; il faut zoomer pour lire les détails du giratoire.

La compilation Nuxt a été rejouée après la dernière correction. Le serveur compilé confirme le parcours monde anonyme, indice du hangar, révélation du projet, puis retour anonyme, sans erreur JavaScript ni erreur d'hydratation détectée.

Le montage côté navigateur suit le [fonctionnement des composants Nuxt](https://nuxt.com/docs/4.x/directory-structure/app/components). Le HTML initial contient le titre, les explications et l'accès au projet avant le chargement des scènes.

### Memebank — validation du 1er octobre 2026

- 77 tests unitaires ; 12 parcours banque et 10 parcours carte/hangar réussis.
- Trois étapes numérotées, styles du hangar réellement partagés, employés et clients ; la croissance géométrique après quota est contrôlée, pas seulement les chiffres.
- Mobile 390 px et largeur intermédiaire 740 px : coins du poste hors fiche, commandes de zoom accessibles, défilement interne, aucun débordement horizontal.
- Lint ciblé et `git diff --check` réussis. Build Nuxt CLI final réussi avec Node 22.15.0 ; avertissements existants de source maps, taille de chunks et base Browserslist ancienne, sans erreur de compilation.
- Smoke test du bundle compilé sur ordinateur et téléphone : garde de curiosité, étapes, dépassement, scénarios, sauvegarde, zoom et retour carte, sans erreur JavaScript ou d’hydratation. Le script public ne dépend pas de l’inspection Vue de développement.
- Revue indépendante : version ordinateur conforme ; masquage mobile corrigé, puis confirmation des deux écarts restants avec disposition « ship ». Détecteur CLI indisponible, aucun score annoncé.

Après le build, attendre le message d’écoute du serveur avant le smoke test :

```sh
node node_modules/nuxt/bin/nuxt.mjs build
HOST=127.0.0.1 PORT=3000 node --env-file=.env .output/server/index.mjs
# Dans un autre terminal, lorsque le serveur est prêt :
npm run test:memebank:production
```

Ne pas compiler dans le même dossier de build qu’un serveur de développement actif. Utiliser la commande Nuxt CLI, et non l’essai d’API programmatique isolée (initialisation Stylus incompatible avec ce lancement ESM).

[Concept, règles et storyboard](<docs/macomisyon-banque-concept.md>) · [Archive visuelle de la banque](<docs/macomisyon/versions/13-memebank-diversion/README.md>)

Cette validation reste celle d’une démo locale. Les objectifs réels, les consentements newsletter, la sélection des candidatures et les invitations ne sont pas branchés à un service réel ; aucun déploiement distant ni build Tina n’a été effectué.

### Handoff — affinement VHS, variante approuvée et sauvegardée

La base approuvée a été sauvée **avant** cet affinement : commit `2f0d480`, tag `macomisyon/13-memebank-diversion`. La nouvelle variante a été **approuvée le 1er octobre 2026 et sauvegardée sous le tag `macomisyon/14-vhs-debordantes`**, sans action distante. Mode **Experience**, héritage du hangar et progression inchangés : trois étapes, newsletter et candidatures parallèles, qualification/invitations distinctes, ouverture bêta explicite. Le diff fonctionnel et visuel est strictement limité aux VHS, à leurs descriptions et au cadrage bêta ; aucune nouvelle identité ni modification des tokens globaux ou du frontmatter. Le [contrat de surface](<.impeccable/surfaces/route-macomisyon.md#L46-L50>) et le [concept](<docs/macomisyon-banque-concept.md#L67>) suffisent à cette persistance locale, sans nouveau sidecar.

**Réalisation et reprise technique.** [VHS procédurales](<app/lib/macomisyon/bank/tapes.js>) : proportions 1 × 0,55 × 0,14, coque noire moulée, deux fenêtres fumées, ruban brun-noir, petits moyeux dentés et grandes inscriptions « MÈMES » / « VHS ». Une texture Canvas opaque partagée de 1024 × 544, sans asset importé. Le coffre conserve 35 cassettes ; sept dégringolent, dont trois sur le tapis et quatre sur le carrelage, sans chevauchement final. Chute parabolique, bascule, départs décalés, petit rebond puis glisse remplacent les anciens confettis bêta. Allocations fixes, aucune RAF propre ; pause, mouvement réduit et restauration retrouvent la même pose finale. Les [tests VHS](<app/lib/macomisyon/bank/tapes.test.mjs>) couvrent ces invariants. Dans [le monde](<app/lib/macomisyon/bank/world.js#L679-L718>), `batchRigid` regroupe les éléments rigides ; [`inspectionView`](<app/lib/macomisyon/bank/world.js#L927-L952>) abaisse la cible bêta desktop de 0,45. Deux phrases de [Memebank](<app/components/macomisyon/MemeBank.client.vue#L24-L49>) décrivent désormais le débordement.

Commande de reprise, sur le serveur déjà disponible :

```sh
BANK_REVIEW_DIR=.impeccable/review/bank-vhs node scripts/verify-memebank.mjs
```

**État transmis par le Lead, sans réexécution documentaire :** 84 tests unitaires et 12 contrôles E2E banque PASS après le dernier correctif ; lint et contrôle du diff PASS ; cadrages 390/740 px contrôlés. L’échec initial de timing `frameScheduled` en mouvement réduit est corrigé dans [la vérification](<scripts/verify-memebank.mjs#L265-L270>) : attendre le rendu unique, puis vérifier 250 ms sans nouvelle frame (PASS). Le nouveau build Nuxt CLI est encore en cours au moment du handoff : **résultat non confirmé**.

Captures fraîches signalées par le Lead, non réinspectées ici : [détail VHS](<.impeccable/review/bank-vhs/vhs-closeup.png>), [coffre ouvert](<.impeccable/review/bank-vhs/vault-vhs-open.png>), [fiche mobile](<.impeccable/review/bank-vhs/mobile-ledger.png>). Archivage et confirmation du bundle de production restent au Lead ; cette passe ne lance ni serveur, navigateur, test ni build.

**Confirmation finale du Lead :** build Nuxt CLI PASS, puis smoke test de production ordinateur/mobile PASS, sans erreur JavaScript ni d’hydratation. La revue indépendante confirme « ship » dans le périmètre VHS : étiquettes lisibles au zoom desktop, sept cassettes visibles, coffre plein, mobile préservé. Aucun score de détecteur CLI annoncé. Les [captures de la variante](<docs/macomisyon/versions/14-vhs-debordantes/README.md>) sont archivées avec provenance et pixels vérifiés identiques. Après validation utilisateur, l’affinement est sauvegardé dans un commit distinct, repéré par le tag `macomisyon/14-vhs-debordantes` ; le repère de la base précédente est conservé.
