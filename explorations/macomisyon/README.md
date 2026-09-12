# Maco’misyon, les étapes de création

Archive des explorations des 10 au 12 septembre 2026. Les fichiers existants ont été regroupés après la conception : les commits ci-dessous sont des jalons d’archivage, pas une reconstitution de chaque modification intermédiaire. Les notes anciennes conservent aussi des propositions écartées depuis.

Branche de travail : `explorations/macomisyon` du dépôt `macojaune/macojaune-print-shop`.

## Dernière démo

[Le dépôt Q, prototype v5](prototype-warehouse-v5/README.md) : tournées du Fenwick à chaque visite, aller chargé et retour à vide, balises d’alerte ambre, missions animées et commandes de pause. Serveur local sur le port 58016. La [v4](prototype-warehouse-v4/README.md) reste intacte sur 58015 et la [v3](prototype-warehouse/README.md) sur 58014.

## Direction retenue

[Îlots vivants : trame de jeu, scènes et architecture proposée](ilots-vivants-2026-09-12.md), 12 septembre 2026. Trame validée à l’origine des POC du dépôt Q ; le brief propre à chaque version précise les retours intégrés.

## Retrouver une étape

| Tag Git | Contenu ajouté | Où regarder |
| --- | --- | --- |
| `macomisyon/01-cadrage` | Vision, questions, étapes par projet, première esquisse de progression, piste Terraink | Les notes Markdown et `progression-aventure.html` |
| `macomisyon/02-directions-graphiques` | Signal jaune, Club Komisyon, Maco Pocket, fusion Signal Pocket et variantes | [Planches](direction-artistique-2026-09-11/README.md) |
| `macomisyon/03-cartes` | Monde explorable, parcours, plateau isométrique et Guadeloupe | [Cartes](monde-explorable-2026-09-11/) |
| `macomisyon/04-plateau-v1` | Première démo, onglets projets, parcours et pont débloqué | `prototype-plateau/v1/`, captures et `demo-mobile.mp4` |
| `macomisyon/05-territoires-v2` | Territoire par projet, branches, zoom, déplacement et panneaux | [Prototype actuel](prototype-plateau/README.md) |
| `macomisyon/06-archive-portable` | Guide de reprise, dépendances des tests et chemins portables | Cette archive complète |
| `macomisyon/07-depot-q-v3` | POC QuiLivreOù, entrepôt vivant et réparation du Fenwick Q | [Démo v3](prototype-warehouse/README.md) |
| `macomisyon/08-depot-q-v4` | Accident, inventaire, mystère, compteurs indépendants et expédition | [Démo v4](prototype-warehouse-v4/README.md) |
| `macomisyon/09-depot-q-v5` | Tournées permanentes, alerte ambre et mode calme | [Démo v5](prototype-warehouse-v5/README.md) |

Chaque jalon conserve les précédents. Sur la dernière branche, les cinq prototypes restent accessibles. Les images, prompts, captures, rapports et vidéos disponibles sont conservés, y compris les variantes abandonnées. Le fichier `manifest-source.json` permet de comparer les originaux aux copies archivées.

## Reprendre sur un autre ordinateur

Prérequis : Git, Node.js 20 ou supérieur, npm et Python 3. Aucune clé ni variable d’environnement n’est nécessaire pour les démos.

```sh
git clone --branch explorations/macomisyon https://github.com/macojaune/macojaune-print-shop.git
cd macojaune-print-shop/explorations/macomisyon/prototype-warehouse-v5
npm ci --ignore-scripts
npm start
```

Ouvrir http://127.0.0.1:58016/ pour la v5. La v4 utilise le dossier `prototype-warehouse-v4` et le port 58015. La v3 utilise le dossier `prototype-warehouse` et le port 58014. Pour les versions précédentes, installer les dépendances et lancer `npm start` dans `prototype-plateau`, puis ouvrir http://127.0.0.1:58012/ pour la v2 ou http://127.0.0.1:58012/v1/ pour la v1. Pour les planches, servir le dossier `direction-artistique-2026-09-11` avec `python3 -m http.server 58011`, puis ouvrir http://127.0.0.1:58011/.

Pour isoler un jalon dans une autre copie depuis le dépôt :

```sh
git fetch origin --tags
git worktree add ../macomisyon-plateau-v1 macomisyon/04-plateau-v1
```

Au jalon v1, installer les dépendances dans `explorations/macomisyon/prototype-plateau`, y lancer le serveur, puis ouvrir `/v1/`. Les anciennes notes contiennent des chemins vers les dépôts locaux inspectés à l’époque ; ces références historiques ne sont pas nécessaires au fonctionnement des démos. Le document fondateur Drive reste une référence externe : l’archive conserve sa synthèse, pas un export du document source.

## Rejouer les vérifications

Depuis `prototype-plateau`, serveur actif dans un autre terminal :

```sh
npx playwright install chromium
npm run test:v1
npm run test:v2
```

Les scripts utilisent Playwright installé dans ce dossier. `DEMO_URL` permet de choisir une autre adresse, avec `/v1/` pour les tests v1. Le premier enregistrement `demo-mobile.mp4` montre la v1. Les tests et captures ne constituent pas une validation sur téléphone physique.

Les compteurs sont fictifs. Les v1/v2 les réinitialisent au rechargement ; les v3/v4/v5 conservent chacune leur avancement local jusqu’à la réinitialisation dans leur console de démo. Cette branche archive la recherche et les prototypes ; elle n’intègre pas encore Maco’misyon dans le site de production.
