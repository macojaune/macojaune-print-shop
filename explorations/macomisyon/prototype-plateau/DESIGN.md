---
name: Maco’misyon, territoires v2
description: Prototype local de deux territoires et de leurs missions
colors: {yellow: "#fbbf24", ivory: "#fff4cf", ink: "#141817", teal: "#168d85", sheet-ink: "#17231a", sheet-action: "#182b21"}
typography:
  display: {fontFamily: "Tanker", fontSize: "clamp(52px,5.2vw,78px)", fontWeight: 400, lineHeight: 1}
  body: {fontFamily: "Space, sans-serif", fontSize: "13px", lineHeight: 1.55}
rounded: {action: "5px", label: "5px", sheet: "13px", status: "4px"}
components:
  button-primary: {backgroundColor: "{colors.yellow}", textColor: "#132019", rounded: "{rounded.action}", padding: "10px 13px"}
  button-sheet: {backgroundColor: "{colors.sheet-action}", textColor: "{colors.ivory}", rounded: "{rounded.action}", padding: "10px 13px"}
---
## Overview
La v2 construit deux territoires 3D distincts dans un même monde. QuiLivreOù possède un étal et des colis ; Shootareas, un appareil photo et des cadres de repérage. Le prototype reste une preuve locale de faisabilité ; reproduction fidèle de la planche et qualité de production ne sont pas établies.
## Colors
Le jaune signale projets, sélection et action sur la carte charbon. Les panneaux ivoire inversent le contraste avec un texte et des actions vert sombre. Les matériaux crème et turquoise de la scène reçoivent leur propre éclairage.
## Typography
Tanker dessine les titres condensés ; Space est le nom CSS de Space Grotesk pour les détails. Fichiers locaux : assets/tanker.woff2 et assets/space-grotesk.ttf. Les titres de panneau passent de 46 à 39 px sur mobile, puis 34 px sur écran court.
## Layout
Écran fixe sans défilement de page. Desktop : grille à deux colonnes, largeur maximale 1450 px et console ambre CSS limitée à 880 px de haut. À 760 px et moins, l’en-tête mesure 78 px, la carte prend la largeur et la coque disparaît. Barre supérieure, carte et sélection inférieure occupent des zones stables. Les panneaux restent dans l’écran ; seul leur contenu défile. Les mises en page compactes changent à 1100 px et sous 700 px de hauteur mobile.
## Elevation & Depth
Caméra Three.js orthographique, lumière hémisphérique et directionnelle, ombres PCF douces. Chaque projet occupe une plateforme continue à contour extrudé ; les branches sont des chemins pointillés. Dégradé et ombres structurent la coque. Les panneaux ivoire flottent sur un voile sombre interne.
## Shapes
Territoires polygonaux épais, arbres géométriques, pions cylindriques et sphériques. Boutons légèrement arrondis, panneau à coins de 13 px, commandes physiques circulaires et croix de peinture en CSS.
## Components
La carte propose glissement, pincement, molette, zoom par boutons et retour à la vue d’ensemble. Le carnet fournit l’accès HTML aux projets et missions. Les panneaux retiennent le focus, se ferment avec Échap et utilisent un focus sombre sur ivoire ; ailleurs, le focus est jaune, épais de 3 px et décalé de 3 px. Les fiches montrent des captures UI réelles locales et des liens vers les sites. Aucune vidéo n’a été fournie : le bouton « Vidéo à venir » est désactivé.
Les branches avancent indépendamment : inscriptions 7/10 et partenaire 0/1 pour QuiLivreOù ; découvertes 8/10 et spots 1/3 pour Shootareas. Seuls les seuils principaux ouvrent leurs étapes dépendantes. Les compteurs restent simulés et bornés. Le rendu répond aux événements et continue pendant les animations seulement. Mouvement réduit rend caméra et pion immédiats et supprime les animations de chemins et panneaux. Le carnet reste disponible sans WebGL.
Les rapports .impeccable/review/v2-tests.json et v2-gestures.json passent : écran stable, branches, présentations, zoom, déplacement, clavier, pincement et confinement du focus. Tailles vérifiées : 1280×800, 390×844 et 360×740. La revue indépendante finale territories_review valide SHIP pour le prototype local après levée de trois réserves ; aucun test sur téléphone physique n’est établi.
## Do's and Don'ts
Do conserver les territoires et branches indépendants, les panneaux internes, les captures réelles et la mention des simulations. Don't présenter un compteur simulé comme une participation réelle ni activer une vidéo sans source fournie.
