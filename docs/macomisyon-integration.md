# Maco'misyon dans Nuxt

La première intégration se trouve à `/macomisyon`. Elle rassemble la carte extérieure de Jarry et le Dépôt Q de QuiLivreOù. C'est une démo locale à compteurs fictifs, sans connexion aux comptes utilisateurs, aux événements de QuiLivreOù, à Zikak ou aux publications sociales.

## Reprendre ici

Le travail se fait directement sur `develop` dans `macojaune-web`, selon le choix de Marvin. Les prototypes antérieurs restent dans `explorations/macomisyon` et le dossier voisin `macomisyon-archive`. Le worktree temporaire `macojaune-macomisyon` a été supprimé après transfert de ses deux documents de préparation.

Le dossier préexistant `.letta/worktrees/macotidien-episode-16` appartient à un ancien travail Letta. Il contient un brouillon d'article non suivi. Il reste conservé et exclu localement du dépôt parent.

## Parcours

1. Arrivée sur un diorama isométrique de Jarry, avec La Jaille, la Voie Verte et le bord de mer.
2. Déplacement et zoom avec le toucher, la souris ou le clavier. La liste des lieux donne le même accès sans sélectionner un objet 3D.
3. Sélection du hangar QuiLivreOù, cadrage de la caméra puis entrée au Dépôt Q.
4. Exploration des Komisyon, de leurs indices et des scénarios de démonstration.
5. Retour à la carte sans perdre le cadrage précédent.

L'intérieur est adressable par `/macomisyon?lieu=depot-q`. Le bouton Retour à Jarry et l'historique du navigateur permettent de changer de scène. La carte reste montée mais suspend son rendu quand le dépôt est affiché. Les scènes respectent la réduction de mouvement du système et le bouton Pause. Leurs rendus, contrôles et ressources GPU sont libérés en quittant la route.

## Où modifier quoi

| Fichier | Rôle |
| --- | --- |
| `app/pages/macomisyon/index.vue` | Cadre de jeu, navigation entre les scènes, commandes et accès textuel |
| `app/components/macomisyon/JarryMap.client.vue` | Montage de la carte, étiquettes et préférences |
| `app/lib/macomisyon/jarry-world.js` | Géométrie de Jarry, caméra, sélection et mouvements |
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

Le montage côté navigateur suit le [fonctionnement des composants Nuxt](https://nuxt.com/docs/4.x/directory-structure/app/components). Le HTML initial contient le titre, les explications et l'accès au projet avant le chargement des scènes.
