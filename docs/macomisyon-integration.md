# Maco'misyon dans Nuxt

La première intégration se trouve à `/macomisyon`. Elle rassemble la carte extérieure de Jarry et le Dépôt Q de QuiLivreOù. C'est une démo locale à compteurs fictifs, sans connexion aux comptes utilisateurs, aux événements de QuiLivreOù, à Zikak ou aux publications sociales.

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
3. Sélection d’un pictogramme, indice sur le lieu, puis entrée au hangar qui révèle QuiLivreOù et son Dépôt Q.
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
node --test app/lib/macomisyon/depot/*.test.mjs
node scripts/verify-macomisyon.mjs
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
