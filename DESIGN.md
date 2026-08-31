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
