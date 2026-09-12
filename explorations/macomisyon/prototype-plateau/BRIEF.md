# Parcours jouable

## Révision : territoires

Marvin demande une coque et un écran de taille fixe, sans mouvement lors des changements d'interface. La page devient un espace à dimensions fixes ; les présentations et fiches de missions défilent à l'intérieur de l'écran.

La carte montre deux territoires continus avec leurs propres points, chemins et accessoires. La sélection des projets se fait sur la carte ou dans un carnet, sans onglets. Zoom par boutons, molette et pincement ; déplacement par glissement. QuiLivreOù possède un atelier et une branche partenaire indépendante des inscriptions. Shootareas possède un appareil photo, un cadre de repérage et une branche idées de spots.

Les panneaux présentent les projets avant leurs compteurs : description, capture réelle de l'interface, lien du site, missions et conditions. Aucune vidéo projet n'a été fournie : le champ video est null et l'action indique Vidéo à venir. Ne pas y substituer la vidéo du prototype.

États explicites : Présentation, En cours, Objectif atteint, À venir et Étape ouverte. Les visites du pion n'accomplissent pas les missions. Les compteurs simulés restent indépendants et leurs critères demeurent illustratifs. Le modèle et les pages v1 sont conservés dans v1/.

Vérification v2 : stabilité des rectangles de la coque et de l'écran sur 1280×800, 390×844 et 360×740, overlay et défilement interne, fermeture Escape, focus, compteur, branches, zoom et déplacement. Pincement tactile testé en émulation, performance physique non validée.

## Référence du premier prototype

Mode : Experience. Prolongement interactif local du plateau choisi. Référence visuelle : ../monde-explorable-2026-09-11/04-plateau-isometrique.png.

Premier écran : grandes plateformes crème à flancs turquoise, pion jaune et ponts sur fond charbon. Tanker pour les titres, Space Grotesk pour les détails. Sur desktop la scène habite une console ambre ; sur mobile la scène prend la largeur disponible.

Interaction signature : faire passer la mission simulée de 7 à 10 déclenche la construction du passage et rend accessible la prochaine étape. Les deux projets possèdent un état distinct. Rejouer remet les deux au départ de la démonstration. Pas de décor photographique utilisé comme faux jeu, pas de dépendance implicite entre projets.

Vérification attendue : rendu mobile et desktop, clic/toucher, navigation au clavier, déblocage une seule fois, compteur borné, changement de projet, mode mouvement réduit et absence de débordement. La performance d'un vrai téléphone reste à mesurer après ce premier essai.
