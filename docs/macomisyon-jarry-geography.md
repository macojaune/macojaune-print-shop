# Jarry, références du premier diorama

Le rendu est un décor de jeu inspiré de Jarry, pas une carte à utiliser pour se déplacer. Les bâtiments des projets sont fictifs. Leur implantation répond aux besoins de navigation dans Maco'misyon.

Le repère de La Jaille reprend les coordonnées données par Marvin : **16.2548421057647, -61.57080966792664**. Le diorama conserve un giratoire, les départs des grands axes, une voie plantée vers les entrepôts et un littoral industriel.

[Routes de Guadeloupe, le giratoire de La Jaille](https://www.routesdeguadeloupe.fr/actualites/2018/le-rond-point-de-la-jaille-plus-de-30-000-vehicules-par-jour/) décrit la liaison entre la Voie Verte, la D32, la RN1 et la RN11. Source officielle consultée le 18 septembre 2026. Le document décrit des travaux de 2018 ; il ne permet pas de reproduire les bretelles actuelles avec précision.

La première scène place le Dépôt Q dans la zone d'entrepôts, Shootareas au bord de l'eau et un atelier Zikak fermé. La côte, les longueurs, l'orientation des voies et les distances sont simplifiées pour la lecture sur téléphone. Le côté bloqué du rond-point évoqué par Marvin reste à préciser avec ses références avant de le reproduire.

Le décor ne charge aucune tuile, image satellite ou ressource géographique externe. Géométries et textures des enseignes sont produites dans `app/lib/macomisyon/jarry-world.js`. Les changements du dépôt sont transmis par `setRepaired`, sans recréer la scène globale.
