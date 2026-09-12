---
name: "Maco’misyon · Dépôt Q · v4"
description: "Console Maco Pocket et entrepôt miniature à remettre en service."
colors:
  yellow: "#ffc52c"
  panel-action: "#ffd04a"
  ink: "#151d19"
  cream: "#fff2c8"
  muted: "#b9c2ae"
  panel: "#182d27"
  panel-text: "#f7edc9"
  slot: "#294638"
  frame: "#c3b77e"
typography:
  display:
    fontFamily: "Tanker, sans-serif"
    fontSize: "clamp(50px, 5.5vw, 78px)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Tanker, sans-serif"
    fontSize: "37px"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "0.015em"
  title:
    fontFamily: "Tanker, sans-serif"
    fontSize: "24px"
    fontWeight: 400
    lineHeight: 1.05
  body:
    fontFamily: "Space, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
  panel-body:
    fontFamily: "Space, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Space, sans-serif"
    fontSize: "10px"
    fontWeight: 700
rounded:
  label-code: "1px"
  game-control: "2px"
  panel: "3px"
  dock-control: "5px"
spacing:
  tight: "4px"
  compact: "8px"
  grid: "10px"
  inset: "12px"
  content: "20px"
components:
  button-dock-primary:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.ink}"
    rounded: "{rounded.dock-control}"
    padding: "11px 14px"
  button-panel-primary:
    backgroundColor: "{colors.panel-action}"
    textColor: "#17271e"
    rounded: "{rounded.game-control}"
    padding: "10px 12px"
  button-dock-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.cream}"
    rounded: "{rounded.dock-control}"
    padding: "11px 14px"
  button-panel-secondary:
    backgroundColor: "#203b2d"
    textColor: "#e9e6c6"
    rounded: "{rounded.game-control}"
    padding: "9px 11px"
  inventory-slot:
    backgroundColor: "{colors.slot}"
    textColor: "#f0eacc"
    rounded: "{rounded.game-control}"
    padding: "9px 10px"
  world-label:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.game-control}"
    padding: "5px 7px 5px 5px"
  game-status:
    backgroundColor: "#2a4632"
    textColor: "#e1eacb"
    rounded: "{rounded.game-control}"
    padding: "6px 8px"
  game-panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.panel-text}"
    rounded: "{rounded.panel}"
  reveal-option:
    textColor: "#d0dbb8"
---

# Design System: Maco’misyon · Dépôt Q · v4

## Overview

**Creative North Star: "La console du dépôt Q"**

La v4 affine le dépôt Q de la v3. Tanker, Space et le jaune Macojaune restent l'identité de la console ambre. Le monde est un entrepôt miniature procédural vu en projection orthographique, avec un Fenwick renversé, une palette et des colis au sol.

Les panneaux verts reprennent un terminal de jeu à cadres courts et coins décrochés. L'inventaire, les icônes et les compteurs montrent les acquis et les réserves. Les transformations du chariot et de la cargaison rendent les réussites visibles dans le lieu.

**Key Characteristics:**

- Console ambre à écran fixe sur desktop, expérience plein écran sur mobile.
- Titres Tanker, textes Space, jaune chaud sur verts sombres.
- Inventaire 2 × 2, icônes SVG et panneaux à coins décrochés.
- Étapes masquées avec indices, compteurs conservés avant déblocage.

## Colors

La coque ambre entoure un écran charbon ; le jaune et le crème restent les repères de l'identité.

### Primary

- `yellow` est le jaune Macojaune des actions du dock, du Q, des repères accomplis et des annonces.
- `panel-action` est la variante chaude des actions principales dans les panneaux.

### Neutral

- `ink` structure la page, la barre du projet et le dock. `cream` porte leur texte clair.
- `muted` accompagne l'introduction et les informations secondaires hors panneau.
- `panel` et `panel-text` définissent les fiches vertes. `slot` donne du relief aux cases ouvertes de l'inventaire ; `frame` dessine leur panneau commun.

**The Jaune Rule.** Le jaune distingue les actions, le Q et les réussites. Les missions verrouillées gardent des tons verts et gris, avec un cadenas et un libellé explicite.

## Typography

Les fichiers locaux sont `assets/tanker.woff2` et `assets/space-grotesk.ttf`. Space est le nom CSS de Space Grotesk. La racine vaut 14px ; les tailles observées sont exprimées en px, avec un clamp en px/vw pour le grand titre.

`display` appartient à l'introduction desktop. `headline` désigne les titres des panneaux ; `title`, le titre du dock. Le corps de panneau a sa propre taille et son propre interligne. Les notes descendent à 10px et les états de case à 8px. Les compteurs de mission utilisent Tanker à 43px, avec leur objectif à 25px ; les cases utilisent 23px et 15px.

**The Deux voix Rule.** Tanker porte les titres et les nombres. Space porte les explications, les boutons et les petits états. Aucune police monospace n'est utilisée.

## Layout

Sur desktop, le conteneur mesure `min(1260px, 100%)` sur `100svh`. La grille sépare introduction et console avec `minmax(270px, .75fr) minmax(0, 1.25fr)`, un écart horizontal de 50px et des marges internes `28px 48px 10px`. La console est limitée à 1000px de haut. Son écran réserve 64px à la barre du projet et 153px au dock ; la coque garde 91px pour ses commandes physiques.

Les panneaux sont centrés dans l'écran, avec 12px autour, une hauteur maximale de 100% et un corps défilant. Le corps a un padding `14px 20px 21px`. L'inventaire conserve deux colonnes, un écart de 10px et quatre cases d'au moins 184px de haut.

| Condition réelle | Adaptation |
| --- | --- |
| Largeur 761 à 1000px | Marges latérales de 24px, écart de 24px, colonnes `minmax(210px, .7fr) minmax(0, 1.3fr)`, titre d'introduction de 55px. |
| Largeur ≥ 761px et hauteur ≤ 740px | Marge haute de 15px, titre d'introduction de 54px, commandes physiques de 73px, haut de coque de 17px. À 761–1000px, la règle suivante de largeur conserve le titre de 55px. |
| Largeur ≤ 760px | Introduction réduite à une marque sur 60px ; texte, pied et coque disparaissent. Console de `calc(100svh - 60px)`, barre de 56px, dock de 148px. |
| Largeur ≤ 760px, panneaux | Marge extérieure de 10px, corps `12px 16px 18px`, titre de 34px, cases d'au moins 176px, écart de 8px, illustrations de case de 51px. |
| Largeur ≤ 760px et hauteur ≤ 720px | Marque sur 48px, console de `calc(100svh - 48px)`, dock de 132px. Les contrôles du dock passent à un minimum de 39px. |
| Largeur ≤ 380px | Corps de panneau avec marges latérales de 12px, titre de case verrouillée de 16px, état de case de 7px, actions du projet empilées. |

La caméra adapte sa portée à `max(12.65, 18 / aspect)` et commence avec un zoom de 1.22 quand le conteneur 3D fait moins de 500px de large. Ce seuil est propre à la caméra, distinct des ruptures CSS.

**The Écran fixe Rule.** Le document ne défile pas. Les panneaux défilent dans leur corps ; la carte conserve ses gestes de déplacement et de zoom.

## Elevation & Depth

La profondeur combine une coque moulée avec dégradé ambre, des ombres internes et portées, et une miniature 3D éclairée par une lumière chaude. Les objets sont construits par géométrie procédurale : Fenwick, palettes, colis, pochettes, rayonnages et rideau de quai. Les panneaux superposent un fond vert, un cadre crème patiné et un second filet intérieur ; les cases ont de petites ombres internes qui suggèrent des emplacements creusés.

Les valeurs complètes des ombres sont conservées dans le sidecar. Les panneaux apparaissent avec un déplacement de 18px sur .25s. La caméra rejoint un point en 650ms ; une réparation intermédiaire dure 1150ms, l'expédition finale 5500ms. Le mouvement réduit supprime les transitions CSS et applique directement les poses et la position de caméra.

## Shapes

La coque garde son contour asymétrique, avec des rayons `37px 37px 67px 37px`, et l'écran son arrondi de 15px. Les commandes du dock sont plus souples que celles des panneaux. Les panneaux ont un cadre de 3px et des coins décrochés sur 9px, formés par un clip polygonal à angles droits. Les cases, états et boutons de jeu ont des rayons courts.

Le Q penche de -5 degrés dans la barre et la cartouche projet. Les pictogrammes sont des SVG tracés sur une grille 24 × 24. Dans les panneaux, le trait vaut 1.8 avec extrémités carrées et jointures en angle ; les grandes illustrations de mission et de case utilisent un trait de 1.5.

## Components

- Les boutons du dock ont une hauteur minimale de 43px. L'action jaune s'éclaircit au survol ; le secondaire reste transparent avec un filet. Dans les panneaux, l'action a un bord inférieur ambre de 3px et un minimum de 45px ; le secondaire est vert, bordé et mesure au moins 41px. Les boutons désactivés gardent une opacité de .48.
- Le panneau commun contient l'inventaire, les fiches de mission, le projet et la simulation. Son en-tête conserve le retour vers l'inventaire et la fermeture. Le focus entre sur la fermeture, reste dans la boîte de dialogue et revient au contrôle d'origine ; Échap ferme la fiche. Le focus visible mesure 3px, décalé de 4px.
- L'inventaire 2 × 2 associe code, icône, nom, état, jauge et compteur. Une case verrouillée garde son compteur mais montre un cadenas et « ÉTAPE VERROUILLÉE ». Si l'objectif est déjà reçu, « RÉSERVE COMPLÈTE » reste visible. Les cases accomplies prennent une bordure et une jauge jaunes.
- Toucher une case ferme l'inventaire et déplace la caméra vers son point. Toucher ensuite le point ouvre le briefing. Les boutons de localisation et de prérequis suivent le même parcours. Les repères sont aussi de vrais boutons HTML, utilisables au clavier ; le Q ouvre toujours le projet.
- La fiche verrouillée montre un indice, les contributions en réserve et le prérequis. La fiche ouverte montre l'objectif, la jauge, l'effet sur le dépôt et un lien de participation. La fiche accomplie propose de revoir le résultat.
- La fiche projet conserve son cartouche Q et un aperçu cliquable de l'annuaire. Son récit couvre cinq états : accident, Q debout, colis rassemblés, boutiques accomplies avant les recommandations, dépôt reparti. L'aperçu et le bouton principal ouvrent QuiLivreOù ; la vidéo absente est un état « Vidéo indisponible » sans faux bouton.
- La console de démo regroupe les contributions simulées, les cinq scénarios et la case à cocher qui révèle les noms verrouillés. Une réussite ferme ce panneau pour montrer son effet. Cette simulation locale reste séparée des liens vers l'annuaire.
- Dans le monde, les inscrits redressent Q, les recommandations réunissent sa cargaison, puis les trois principales accomplies ouvrent le rideau et expédient les colis. Le bonus ajoute son chargement et ses touches de décor indépendamment. Les acquis restent présents après rechargement lorsque le stockage local est disponible.

**The Acquis visibles Rule.** Le compteur, le verrou et la réussite sont trois informations distinctes. Un objectif reçu avant son prérequis reste en réserve ; le bonus ne répare pas le quai.

## Do's and Don'ts

### Do:

- Do conserver Tanker, Space et la palette Macojaune dans la console et ses panneaux.
- Do montrer les contributions reçues même quand le nom de la mission reste masqué.
- Do faire correspondre le récit du projet aux acquis visibles dans le dépôt.
- Do préserver les boutons accessibles au clavier, les indices et le mouvement réduit.

### Don't:

- Don't ajouter de pion à ce dépôt.
- Don't remplacer les panneaux verts par les anciennes fiches crème.
- Don't utiliser la réussite du bonus pour ouvrir le quai.
- Don't confondre les commandes de simulation et les liens vers l'annuaire réel.
