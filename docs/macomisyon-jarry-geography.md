# Géographie réelle, monde imaginaire

Le décor reprend les formes réelles de Jarry pour qu'une personne qui connaît les lieux puisse les reconnaître. L'emprise approuvée le 12 octobre 2026 couvre toute la zone de l'entrée de La Jaille jusqu'à la pointe et au port, avec la mangrove et le littoral. L'interface conserve le monde anonyme : elle ne le nomme ni Jarry ni La Jaille. Les bâtiments des projets et leurs activités restent fictifs.

## Géographie utilisée depuis le 12 octobre 2026

Le terrain, les routes, les surfaces végétales et les empreintes bâties viennent d'un extrait vectoriel OpenStreetMap. La collecte du 12 octobre a reçu deux instantanés de juillet 2026 : le contexte date du 28 juillet et les bâtiments du 15 juillet. Ces dates ne prouvent pas l'état des routes, des chantiers ou des bâtiments au jour de la collecte.

La [documentation des sources](macomisyon-geography-sources.md) donne la provenance, les dates, la licence ODbL, les limites et la procédure de préparation. L'interface affiche l'attribution « © OpenStreetMap contributors » avec son lien. Le navigateur charge le JSON préparé dans le dépôt ; il ne charge aucune tuile ou photographie satellite.

Le rectangle extrait mesure environ 5,45 × 5,12 km et comprend un peu de territoire voisin, notamment l'autre rive à l'est. Le rendu utilise une unité de scène pour 20 mètres et conserve les proportions horizontales. Les bords rectilignes de l'extraction sont des limites de cadrage. Ils ne doivent jamais devenir des portions de rivage inventées ou transformer Jarry en île fantaisiste.

Les silhouettes à conserver sont la péninsule industrielle, les baies, le chenal, les avancées de mangrove, le port et les îlets. Les routes suivent leurs polylignes réelles, y compris aux carrefours. Leur largeur et le relief des ponts sont adaptés à la miniature ; les raccordements doivent rester continus. Les arbres ne doivent masquer ni les voies ni les bretelles.

## Volumes et limites de représentation

Le style reste une miniature isométrique en 3D : façades claires, toits pastel, arbres à facettes, eau turquoise et relief sobre. Les surfaces et bâtiments de même matériau sont fusionnés ; les arbres sont instanciés. La précision du tracé ne nécessite pas un objet de rendu distinct pour chaque bâtiment.

Le jeu de données contient une sélection de 1 500 empreintes bâties, dont certaines sont retirées du décor pour réserver les emplacements des projets. Il ne constitue pas un inventaire complet. Les empreintes sont réelles et simplifiées ; les couleurs, toitures, arbres individuels et hauteurs du rendu sont stylisés. Les rares hauteurs renseignées comprennent des valeurs OSM et des estimations par nombre d'étages. Elles ne sont pas toutes mesurées. Le rendu borne les volumes ordinaires entre 0,45 et 1,5 unité de scène.

Les quatre bâtiments des projets peuvent remplacer du bâti de fond, mais leurs parvis et leurs modèles doivent laisser les routes libres. Les grues et le bateau donnent du relief au port sans prétendre reproduire son équipement actuel.

## Découverte des projets

La carte conserve quatre lieux : « La banque », « Le hangar », « La maison sur l'eau » et « L'atelier fermé ». Le toucher, le clavier et la liste des lieux donnent les mêmes indices. Les noms des projets ne figurent ni dans les marqueurs, ni dans leurs libellés accessibles, ni dans le titre de page extérieur.

Les deux intérieurs existants sont conservés. Le hangar révèle QuiLivreOù après l'entrée. La banque révèle Memebank après le palier de curiosité simulé. ShootAreas et Zikak restent des façades fermées. Le retour extérieur reprend les noms anonymes et le cadrage précédant l'entrée. Les compteurs et la progression restent des simulations locales.

L'agrandissement prépare de la place pour l'ensemble des 13 projets recensés. Il n'implante pas neuf nouveaux lieux : leurs emplacements, silhouettes, indices et intérieurs restent à décider.

## Navigation de la carte

La vue initiale cadre l'ensemble de l'emprise sur ordinateur et téléphone. Le visiteur peut glisser dans le plan X/Z, pincer à deux doigts pour zoomer ou dézoomer et utiliser les commandes +, − et Recentrer. La cible reste bornée à l'emprise ; sa hauteur reste à zéro. Le zoom manuel va de 0,6 à 24. Le rapprochement d'un lieu dépend du format disponible ; il n'utilise plus la valeur fixe 3,6 de l'ancienne carte.

Les pictogrammes conservent des cibles de 46 × 46 px. Lorsque la vue générale rapprocherait trop les repères, certains sont masqués pour éviter les chevauchements. Le lieu sélectionné est prioritaire. La liste ordinaire garde accès aux quatre lieux, y compris aux repères masqués. Glisser depuis un repère déplace la carte sans sélectionner le lieu à la fin du geste.

Au clavier, les flèches déplacent la carte, + et − changent le zoom et Début retrouve la vue d'ensemble. Les boutons de lieux restent accessibles au clavier. Pause, réduction de mouvement, reprise du cadrage après un intérieur et accès textuel sans WebGL sont conservés.

## État de la reprise du 12 octobre 2026

La validation locale est terminée : 84 tests unitaires, 33 contrôles navigateur, neuf états visuels et le build Nuxt passent. Les parvis de la banque et du hangar ont été déplacés, puis contrôlés sur ordinateur, téléphone émulé et format intermédiaire. Le bundle compilé a été exercé sur ordinateur et mobile ; le port a aussi été contrôlé après retrait des conteneurs et recalage des grues. Le [compte rendu](macomisyon-jarry-validation.md) précise les étapes, preuves et limites. Marvin a confirmé la ressemblance de Jarry. Les performances sur téléphone physique restent à valider ; aucun déploiement distant n'est couvert par ces contrôles.

## Références historiques de la composition précédente

Avant l'extrait OSM, la carte utilisait une géométrie composée à partir de deux captures aériennes fournies par Marvin :

- `file-014bb6848926dc2b746bbccc037f2f79.png` montrait le giratoire de La Jaille, son axe nord-sud, la voie rapide est-ouest, les bretelles et les masses végétales voisines.
- `file-659ac8e9c174847cf385c2845058cf8e.png` montrait l'étendue industrielle, le massif boisé au nord, la baie au sud, la mangrove et la pointe portuaire.

Le giratoire avait été repéré à `16.2548421057647, -61.57080966792664`. Marvin avait signalé des murets de chantier sur son axe de 7 heures. Cette observation appartient à la référence historique ; elle ne prouve pas l'état actuel du chantier et n'impose pas de reconstruire ces murets dans l'extrait OSM. L'article [Routes de Guadeloupe de 2018](https://www.routesdeguadeloupe.fr/actualites/2018/le-rond-point-de-la-jaille-plus-de-30-000-vehicules-par-jour/) reste un complément historique. Ces sources expliquent l'ancienne composition ; le JSON OSM documenté ci-dessus définit désormais la géométrie du décor.
