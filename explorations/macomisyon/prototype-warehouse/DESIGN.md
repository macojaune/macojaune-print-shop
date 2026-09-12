---
name: "Maco'misyon · Le dépôt Q"
description: "Un entrepôt miniature à remettre en marche dans la console Maco Pocket."
colors:
  yellow: "#ffc52c"
  ink: "#151d19"
  cream: "#fff2c8"
  muted: "#b9c2ae"
  sheet-action: "#173d2e"
  scene-yellow: "#ffc62b"
  scene-cream: "#f6ecd5"
  scene-teal: "#518579"
  kraft: "#c69159"
  floor: "#cac8b7"
  backdrop: "#e3dcc6"
typography:
  display:
    fontFamily: "Tanker, sans-serif"
    fontSize: "clamp(50px, 5.5vw, 78px)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.02em"
  panel-title:
    fontFamily: "Tanker, sans-serif"
    fontSize: "39px"
    fontWeight: 400
    lineHeight: 1
  body:
    fontFamily: "Space, sans-serif"
    fontSize: "14px"
    lineHeight: 1.6
  button:
    fontFamily: "Space, sans-serif"
    fontSize: "12px"
    fontWeight: 700
  map-label:
    fontFamily: "Tanker, sans-serif"
    fontSize: "15px"
    fontWeight: 400
rounded:
  label-code: "3px"
  control: "5px"
  sheet: "13px"
  screen: "15px"
spacing:
  control-gap: "8px"
  screen-gutter: "18px"
  sheet-gutter: "23px"
components:
  button-primary:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "11px 14px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.cream}"
    rounded: "{rounded.control}"
    padding: "11px 14px"
  button-sheet:
    backgroundColor: "{colors.sheet-action}"
    textColor: "{colors.cream}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "11px 14px"
  world-label:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "5px 7px 5px 5px"
---

# Design System: Maco'misyon · Le dépôt Q

## Overview

**Creative North Star: "Le dépôt Q"**

Un entrepôt de transitaire en miniature, centré sur le Fenwick jaune Q. Les cartons, pochettes souples, palettes et rayonnages donnent au lieu son échelle de jouet. La console ambre encadre cette scène sur ordinateur ; le mobile lui réserve l'écran disponible.

Le véhicule raconte l'avancement par ses pièces et sa lumière. Le décor garde les traces des missions accomplies. Cette documentation décrit le POC v3 actuel et les engagements déjà fixés dans [BRIEF.md](BRIEF.md) et [PRODUCT.md](PRODUCT.md), sans nouvelle direction graphique.

**Key Characteristics:**

- Entrepôt en coupe, caméra orthographique et matériaux mats.
- Jaune Q, coque ambre, interface charbon et panneaux crème.
- États lisibles par texte et symboles, avec accès aux missions hors de la scène 3D.
- Réparations visibles et conservées localement lorsque le stockage est disponible.

La documentation repose sur le code. Les modèles sont procéduraux, sans assets GLB. Le comportement sur téléphone physique reste à vérifier. De fines stries au sol restent un défaut visuel connu de faible gravité ; cette fiche ne vaut pas validation de production.

## Colors

Le jaune identifie Q, les actions principales et les réussites. Le charbon délimite les commandes ; le crème éclaire les panneaux et le monde.

- Primary : `yellow` porte la marque et les actions de l'écran. `scene-yellow` colore le chariot sous l'éclairage 3D ; conserver cette distinction avec la couleur CSS.
- Secondary : `sheet-action` porte les boutons des panneaux clairs. `scene-teal` colore les structures, accessoires et détails du bonus.
- Neutral : `ink`, `cream` et `muted` organisent le texte. `scene-cream`, `kraft`, `floor` et `backdrop` gardent l'entrepôt chaud et lisible.

Sources : [style.css, lignes 1–2](style.css#L1), [props.js, palette](props.js#L7), [world.js, éclairage et fond](world.js#L36). Les couleurs 3D sont des couleurs de matériau ; le rendu éclairé et le tone mapping modifient leur apparence.

## Typography

Tanker compose la marque, les titres, les codes de mission et les grands compteurs. Space Grotesk, déclaré sous le nom CSS `Space`, compose les descriptions et les commandes. Les deux fichiers de police sont locaux dans `assets/`.

Le grand titre desktop utilise `display`. Les titres des panneaux utilisent `panel-title`, réduit à 37 px sous 761 px. Le corps des panneaux est à 12 px ; les informations de statut restent courtes. Les étiquettes de la scène descendent de 15 à 14 px sur mobile. Conserver le texte complet des titres de réussite et permettre au titre du dock de rétrécir dans la rangée sans pousser le compteur.

Sources : [style.css](style.css#L1), règles des panneaux et des étiquettes à la ligne 2, adaptations aux lignes 5–6, flexibilité du titre à la ligne 10.

## Layout

L'expérience occupe `100svh` sans défilement de page. Sur ordinateur, le conteneur plafonne à 1260 px et juxtapose introduction et console. L'écran, sa barre supérieure et le dock restent fixes ; l'exploration déplace la vue du dépôt à l'intérieur.

À 760 px et moins, la coque et les boutons matériels disparaissent. La marque occupe 60 px, puis la console prend la hauteur restante. La barre du projet fait 56 px et le dock 148 px. Sous 720 px de hauteur, la marque passe à 48 px et le dock à 132 px. Les panneaux s'ouvrent dans l'écran et leur contenu défile indépendamment.

Les noms de station sont des boutons HTML projetés sur les points 3D. Ils évitent les recouvrements usuels et disparaissent si leur point sort du champ. Le bouton « Les missions » fournit l'accès permanent à la liste. Sources : [index.html](index.html#L7), [style.css, responsive](style.css#L3), [world.js, positionLabels](world.js#L280).

## Elevation & Depth

La coque ambre emploie un dégradé et des ombres internes pour évoquer du plastique moulé. Les étiquettes et panneaux portent des ombres courtes qui les détachent de la scène. Ces effets appartiennent à leurs composants ; ils ne constituent pas une élévation uniforme pour toute l'interface.

Le dépôt a une dalle épaisse, des murs coupés, des volumes biseautés et des ombres douces. Les matériaux sont majoritairement mats, avec une rugosité par défaut de 0,82. La lumière chaude révèle la réparation finale. Sources : [style.css](style.css#L2), [props.js, matériaux et volumes](props.js#L13), [world.js, dalle et éclairage](world.js#L36).

## Shapes

Les petits contrôles sont légèrement arrondis ; les panneaux et l'écran ont des angles plus larges. La coque desktop garde son arrondi asymétrique `37px 37px 67px 37px`. Le monogramme Q tourne de −5 degrés. Les boutons ronds et la croix appartiennent au matériel de la console.

Dans la scène, cartons rigides et pochettes irrégulières restent distincts. Les biseaux captent la lumière sans gonfler tous les objets. Sources : [style.css](style.css#L2), [props.js, parcel et mailer](props.js#L78).

## Components

- Actions : jaune sur charbon dans le dock, vert sombre sur crème dans les panneaux. Le bouton secondaire garde une bordure fine. Le focus est jaune, puis vert sombre sur panneau clair.
- Stations : numéro pour une mission ouverte, cadenas pour une mission bloquée, coche pour une mission accomplie. La couleur accompagne ces symboles. Le libellé accessible nomme aussi l'état. Q garde son identité et ouvre le projet même lorsque le chariot est en panne.
- Panneaux : présentation du projet, liste des missions, détail d'une mission et choix des états de démonstration partagent la même feuille crème. Fermeture par bouton ou Échap, focus contenu dans le dialogue puis rendu au déclencheur.
- Progression : trois segments et le compteur `0/3` à `3/3` suivent les principales. Le bonus indépendant enrichit le décor. Les listes indiquent le statut en toutes lettres ; le détail combine statut, compteur, progression et effet attendu.
- Réparation : alimentation rétablie et capot fermé, mât redressé, puis palette soulevée et dépôt éclairé. Après la troisième principale, seul le petit gyrophare continue à varier ; le chariot et le cadrage restent fixes. Le mouvement réduit applique directement les poses. Les animations s'arrêtent hors visibilité.

Sources : [app.js, panneaux et progression](app.js#L13), [world.js, symboles et poses](world.js#L201), [world.js, animation](world.js#L299), [model.js, stockage](model.js#L118). Aucun champ de saisie n'existe dans cette version.

## Do's and Don'ts

- Do conserver le Fenwick Q au centre de la lecture du dépôt, avec ses pièces de réparation distinctes.
- Do garder des boutons HTML, des statuts écrits et les symboles de cadenas et de coche en complément de la 3D.
- Do préserver les poses acquises au rechargement lorsque le stockage local est disponible.
- Do garder les mentions de simulation près des commandes de contribution.
- Don't introduire de pion ni de fontaine dans ce dépôt.
- Don't transformer la capture documentaire du site en faux décor 3D.
- Don't présenter QuiLivreOù comme un transporteur ou les contributions simulées comme des actions réelles.
