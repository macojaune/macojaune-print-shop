---
name: Macojaune
description: A black photographic portfolio sharpened by amber type and direct editorial controls.
colors:
  primary: "#fbbf24"
  primary-soft: "#fcd34d"
  primary-pale: "#fde68a"
  background: "#000000"
  surface-dark: "#0c0a09"
  foreground: "#ffffff"
  text-muted: "#d6d3d1"
typography:
  display:
    fontFamily: "Tanker, sans-serif"
    fontWeight: 400
    lineHeight: 0.92
  body:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.28em"
rounded:
  none: "0px"
spacing:
  page-gutter: "16px"
  action-y: "8px"
  action-x: "16px"
components:
  action-link:
    textColor: "{colors.primary-pale}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "8px 0"
    height: "44px"
---

# Design System: Macojaune

## Overview

**Creative North Star: "La planche-contact jaune"**

Macojaune presents photography on a black field with little visual chrome. Amber carries the identity and directs attention. Large Tanker lettering gives titles the weight of a poster, while Space Grotesk keeps captions, navigation, and long copy clear.

The system is direct and graphic. Photographs, titles, and actions establish the hierarchy. Fine borders, muted stone text, and restrained transparency separate supporting material without turning every section into a card.

**Key Characteristics:**

- Black page fields with amber identity marks.
- Compressed display lettering against measured body copy.
- Square controls, thin borders, and visible keyboard focus.
- Mobile-first reading order with wider editorial grids when the content needs them.

## Colors

Amber is the only recurring accent. White and stone tones carry content on black and near-black fields.

### Primary

- **Macojaune Amber:** Brand names, key headings, primary links, active states, and focus rings.
- **Warm Amber:** Softer emphasis, hover states, and secondary labels.
- **Pale Amber:** Low-intensity actions and text that needs more warmth than white.

### Neutral

- **Black Field:** The page background and default setting for the work.
- **Deep Stone:** A slight tonal lift for dark content areas.
- **Gallery White:** Main text and high-contrast headings.
- **Muted Stone:** Supporting copy, metadata, and quiet navigation.

**The Amber Signal Rule.** Use amber to establish identity or action. Do not add unrelated accent colors to ordinary page structure.

## Typography

**Display Font:** Tanker with a sans-serif fallback
**Body Font:** Space Grotesk with a sans-serif fallback

**Character:** Tanker is compact, blunt, and poster-like. Space Grotesk handles the site around it without competing with the photographs or display type.

### Hierarchy

- **Display:** Tanker at large responsive sizes, usually uppercase with tight leading. Use it for page titles, project names, and strong section headings.
- **Headline:** Tanker at medium display sizes with the same compressed leading. Use it to divide long pages or name image groups.
- **Body:** Space Grotesk at the body token size and relaxed line height. Keep paragraphs narrow enough to scan beside imagery.
- **Label:** Space Grotesk at the label token size with wide tracking and uppercase text. Use it for metadata, navigation cues, and compact actions.

**The Two-Voice Rule.** Tanker speaks for titles and identity. Space Grotesk handles everything the visitor must read or operate.

## Layout

Pages start as a single column with the page-gutter token on each side. The global shell centers content in the site container. Dense editorial pages may move to a twelve-column grid at the large breakpoint, while the source order remains useful on a phone.

Content width follows the material. Display lines stay deliberately short, body copy uses a readable measure, and images can claim the larger share of a row. Section spacing is generous, but controls retain compact internal padding and a minimum 44px target height.

**The Phone Order Rule.** Set the hierarchy in the single-column source order first. Desktop columns may change placement, never meaning.

## Elevation & Depth

The system is flat by default. It uses black-to-stone tonal shifts, fine translucent borders, image overlays, and occasional shadows on content that must sit physically above the page. Shadow is not default card decoration.

**The Flat Field Rule.** Keep navigation and ordinary content on the page field. Reserve a shadow for a photograph, overlay, or object whose raised position communicates something.

## Shapes

Square corners are the default for actions, editorial blocks, and image frames. Thin borders define edges without softening them. Small radii belong to fields or minor controls that need a familiar input affordance. Full pills are limited to compact status or metadata chips.

## Components

### Buttons and action links

- **Shape:** Square by default, with a minimum 44px target height.
- **Primary:** Amber fill with black text for the clearest page action.
- **Text action:** Pale amber or muted stone text, wide uppercase tracking, and no decorative container.
- **Hover and focus:** Shift toward a nearby amber tone. Keyboard focus uses a visible amber ring with black offset against the page.

### Cards and containers

- **Corner style:** Square.
- **Background:** Black, deep stone, or a photographic field.
- **Depth:** Prefer a fine translucent border or tonal change. Use shadows only when the content behaves like a raised object.
- **Internal padding:** Follow the page rhythm and increase at larger breakpoints when the content warrants it.

### Navigation

The Macojaune wordmark uses Tanker and amber. Supporting navigation uses Space Grotesk, compact uppercase labels, and amber hover states. The global shell keeps a skip link that becomes visible on focus.

## Do's and Don'ts

### Do:

- **Do** keep the page field black and let amber identify the important words and actions.
- **Do** use Tanker for short, high-impact display copy and Space Grotesk for readable content.
- **Do** preserve a clear phone reading order and visible focus treatment.
- **Do** separate content with spacing, thin borders, and tonal changes before adding a container.

### Don't:

- **Don't** introduce a new accent palette for an ordinary page or component.
- **Don't** set paragraphs or operational copy in Tanker.
- **Don't** round every block into a generic card.
- **Don't** use animation, color, or image position as the only way to communicate state.

## OBSERVATION — Variante locale Maco’misyon — héritage du Dépôt Q

Cette observation décrit une extension ordinaire du jeu existant, non une nouvelle identité Macojaune. Le frontmatter, les tokens et toutes les règles globales ci-dessus restent inchangés, notamment Amber Signal, Two-Voice, Phone Order et Flat Field. Les valeurs locales constatées ne deviennent pas de nouveaux tokens globaux et cette documentation n’autorise aucune modification de l’identité du site.

Les intérieurs emploient l’encre vert sombre (`--depot-ink`, #1a302a), le papier sable (`--depot-sand`, #f6edce), le jaune d’action (`--depot-yellow`, #ffcf43) et la menthe des étapes accomplies (`--depot-mint`, #b6d4b8). La banque pose sa miniature sur un fond sauge (#d6dfc7). Ces couleurs prolongent les matériaux de la carte et du hangar ; elles ne remplacent pas le noir, l’ambre et le blanc des pages ordinaires. Les bandeaux et panneaux sombres portent les textes clairs ; Tanker reste réservé aux titres et compteurs, Space Grotesk aux explications et commandes.

Sur la carte extérieure, sélectionner un lieu ouvre une fenêtre non modale à droite, avec titre, fermeture et actions regroupés. Sur écran étroit, cette fenêtre flotte au-dessus des commandes du bas et son contenu défile. Elle remplace le bandeau permanent ; la liste et l’aide restent accessibles sans sélection. Le titre reçoit le focus à l’ouverture, Échap ferme la fiche sans recentrer la carte. Les crédits temporisés attendent que la fiche soit fermée pour disposer à nouveau de six secondes de lecture.

[Dépôt Q](<app/components/macomisyon/DepotQ.client.vue#L231>) et [Memebank](<app/components/macomisyon/MemeBank.client.vue#L200>) chargent exactement la même [feuille de styles intérieure](<app/assets/css/macomisyon-interior.css>). Dock, inventaire, fiche de mission, compteur, jauge et scénarios héritent donc d’une source commune, pas d’une nouvelle famille de cartes. Les adaptations propres à la banque, dont la fiche mobile défilante et le cadrage d’inspection, restent locales ; leurs réserves de place sont couplées en source, avec les limites de validation consignées dans le [rapport documentaire](<.impeccable/review/bank/documentation-review.md>).

À l’extérieur, les pictogrammes, silhouettes et indices laissent les projets anonymes ; « La banque » ne révèle Memebank qu’à l’intérieur. La coupe spacieuse distingue Étape 1, Étape 2 et Étape 3. Deux employés restent absorbés par leurs bureaux, des clients attendent, et le volume de courrier et de dossiers augmente encore après les quotas. Le coffre montre uniquement des VHS, y compris les cassettes débordant sur le tapis, sans argent, lingots ni salon de testeurs. Les compteurs et actions sont des simulations locales : aucune inscription newsletter, invitation ou admission réelle n’est créée. Ce constat de scène n’étend pas les règles des autres pages.

### Territoire et navigation, reprise du 12 octobre 2026

La carte extérieure couvre désormais l'emprise approuvée de La Jaille à la pointe et au port de Jarry, en conservant le littoral, les îlets, le chenal et la mangrove. Les contours et routes proviennent d'OpenStreetMap, avec des instantanés de juillet 2026 collectés le 12 octobre. La [provenance géographique](docs/macomisyon-geography-sources.md) documente leurs dates, la licence ODbL et les limites. L'attribution OpenStreetMap reste visible et liée à sa source. Les limites rectilignes de l'extraction ne doivent pas devenir un rivage inventé : le décor représente un morceau de territoire réel.

Le rendu conserve la miniature isométrique, les façades claires, les toitures pastel, les arbres à facettes et l'eau turquoise. Les proportions horizontales suivent le terrain à raison de 20 mètres par unité de scène. Les 1 500 empreintes bâties du jeu de données forment une sélection simplifiée ; le rendu en retire autour des emplacements fictifs des projets. Les hauteurs, matériaux, arbres individuels et accessoires portuaires restent stylisés. Les modèles et parvis des projets doivent respecter les voies. Ces choix prolongent la variante locale sans changer l'identité du portfolio.

Quatre lieux extérieurs et deux intérieurs sont conservés : banque, hangar, maison sur l'eau et atelier ; Dépôt Q et Memebank pour les intérieurs. L'emprise agrandie réserve de l'espace aux 13 projets recensés. Les neuf lieux supplémentaires ne sont pas implantés et leurs formes restent à définir. L'anonymat des lieux extérieurs et les révélations à l'intérieur continuent de guider la découverte.

La vue initiale montre l'emprise entière. Le visiteur glisse dans le plan X/Z, pince pour zoomer ou dézoomer, ou utilise les commandes et le clavier. Le zoom va de 0,6 à 24 ; le rapprochement d'un lieu s'adapte à la taille disponible. Le cadrage précédant une entrée reste restauré au retour. Les pictogrammes gardent leurs cibles de 46 × 46 px. Les repères trop proches sont masqués dans la vue générale, avec priorité au lieu sélectionné ; la liste reste accessible pour les quatre lieux. Pause, réduction de mouvement et accès textuel sans WebGL restent requis.

La validation locale est concluante : 84 tests unitaires, 33 contrôles navigateur, neuf états visuels et le build Nuxt passent. Les parvis ont été déplacés et recapturés ; les accessoires portuaires qui coupaient des voies ont été retirés ou recalés. Le bundle compilé a ensuite été contrôlé sur ordinateur et mobile, avec revue du port par navigation réelle. Le [rapport de validation](docs/macomisyon-jarry-validation.md) distingue chaque étape. Aucun déploiement distant ; performances sur téléphone physique non mesurées. Le [brief géographique](docs/macomisyon-jarry-geography.md) distingue la géométrie actuelle des références aériennes et cadrages historiques.

### Relief de Jarry — 22 octobre 2026

La [reprise géographique](docs/macomisyon-jarry-relief.md) remplace le terrain plat par une grille altimétrique à 25 m et porte le jeu de données à 5 693 empreintes bâties. Rues, littoral et limites végétales restent alignés sur OSM, sans exagération verticale. Les noms des rues apparaissent au rapprochement ; les projets restent anonymes à l'extérieur, à l'exception de MAGGMA Studio dont la fiche donne accès au site du studio. Les arbres individuels et hauteurs non renseignées restent interprétés. Les quatre lieux initiaux conservent leurs silhouettes et reposent sur des fondations localisées, sans remodeler le relief environnant. Les couleurs appartiennent toujours à cette variante locale du jeu.

Drift préexistant signalé, non réparé : le sidecar `.impeccable/design.json` est absent (glob puis tentative de lecture). Aucun sidecar, seed ou système global de remplacement n’est créé pour cette extension.
