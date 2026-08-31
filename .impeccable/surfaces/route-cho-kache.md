---
version: 1
slug: "route-cho-kache"
primary_target: "route:/cho-kache"
related_targets: ["app/pages/cho-kache/index.vue", "app/components/cho-kache/ChoKacheMap.vue", "app/components/cho-kache/ChoKacheDiscoveryForm.vue"]
---

# Cho Kaché surface brief

## Scope and mode

This brief governs `/cho-kache`. Its mode is Persuade. A visitor should understand the hunt, see what is still active, and choose either to search or report a find within a few seconds on a phone.

## Audience, job, and actions

The page serves people in Guadeloupe who heard about a hidden photo or encountered one by chance. The primary action is `J'en ai trouvé un`. It opens the inline discovery form. `Voir les 3 photos` is secondary and leads to the active photos. Reading the project story is useful but subordinate.

When no print is active, remove search and find actions rather than leaving dead controls. Keep the empty state plain and direct.

## Voice and public copy

Write direct, spoken French and address the visitor as `tu`. When Macojaune is the actor, write in the first person, for example `je cache` or `je te préviens`, instead of describing him from the outside.

Keep labels short and literal. One brief aside may appear when it sounds natural, but do not build the page voice out of asides. Public copy says `photo` or `tirage`, never `print`. Internal data names may keep the existing technical term.

Do not use marketing language or explain the project through abstract concepts. Avoid words such as `expérience`, `activation`, `engagement`, or `communauté` when a plain sentence says what happens. Do not force a cache-cache joke into headings, states, or instructions.

Sharing stays explicitly optional. Use a plain form such as `si tu veux`. Never justify the request, suggest that sharing helps the project, or pressure the finder with duty, urgency, or reward.

## Direction

Stay inside the Macojaune black and amber system, with Tanker for display type and Space Grotesk for copy. The focal object is a monochrome thermal ticket with a torn edge, light paper texture, and the live active count. It sits as an object above the black field, not as a polished dashboard card.

Below it, active prints form an irregular wall of search posters. Public and secret locations use different material states while remaining part of one poster family. The arrangement may become asymmetric on large screens, but the mobile source order stays linear.

The public-location map sits between the hunt introduction and the poster wall. Its default is Mapbox Standard with the monochrome theme and night light preset. Near-black land and water, stone roads, amber motorways, amber ticket markers, square controls, and the page's black field keep it inside the Macojaune world. Points of interest, transit labels, and 3D objects stay hidden.

An optional Mapbox Studio style URL may replace Mapbox Standard. The custom style must preserve the same black, stone, and amber direction. The component must not apply Mapbox Standard basemap configuration to a custom Studio style.

The map is supplementary. Every public location remains readable in its poster when the map, WebGL, or Mapbox token is unavailable.

## State and secrecy

A public location may show its verified zone label, detail, icon, and clue. A secret location shows a lock, a redacted location line, and its allowed clue. The distinction must remain explicit in text and structure, not color alone.

Only active prints with `location.visibility === 'public'` and finite latitude and longitude values may enter the mapped set. Apply this filter before creating bounds, markers, popups, or any Mapbox-facing payload. Repeat the guard at the marker boundary.

Never send secret coordinates, precise addresses, hidden labels, or private location metadata to Mapbox. Public responses and page source must omit secret coordinates as well. The public state receives only fields approved for publication. Cards expose only a public label such as `Photo n°1`, `Photo n°2`, or `Photo n°3`.

The internal discovery code never appears in public copy, cards, map markers, accessible names, page source, or public payloads. The QR supplies it to the discovery route. The same code is printed on the back of the tirage so a finder can enter it if the QR scan fails.

## Map states and accessibility

The missing-token state uses the same black field, amber line work, square border, Tanker heading, and direct French voice as the hunt. It explains that public positions will appear after connection. A Mapbox load or runtime error uses a branded dark fallback and directs visitors to the public posters below. Neither state should resemble a generic SDK warning.

When the interactive map exists, expose its container as a named region with `role="region"`. Its accessible name reports that it is a Guadeloupe Cho Kaché map and includes the current count of public mapped positions. The posters remain the non-map route to the same public information.

## Participation flow

`J'en ai trouvé un` opens `ChoKacheDiscoveryForm` in the page instead of sending the finder to another service. The form may collect a contact, a note about the place, an explicit GPS position, and up to three photos or videos. Every one of these inputs is optional. GPS requires a clear user action and must never run by default.

Submitting the form never publishes text, coordinates, or media automatically. The server records the report for review and verifies it before changing the photo's status. A browser response alone cannot mark a photo as found.

Store finder media under the dedicated `private/cho-kache/discoveries/` prefix in the existing R2 bucket. The `macojaune-cho-kache-private-guard` Worker blocks that prefix on the public CDN while server-side S3 access remains available. Publishing selected media requires a later, deliberate action.

The finder may photograph or film the discovery, scan the ticket, and take the tirage. Sharing stays optional and needs no supporting argument. Account creation, social posting, contact details, a location note, GPS, and media are not conditions. Keep the steps short, numbered, and readable as one compact mobile sequence.

## Memorable moment and motion

The opening ticket is the memorable object. Its torn silhouette, monochrome print treatment, and oversized count connect the web page to the physical ticket. The short settling motion may run only when reduced motion is not requested. No other animation should compete with it.

## Responsive behavior

On phones, show the title and explanation first, then the actions, inline discovery form when opened, ticket, public map, poster wall, and participation steps. Stack actions to full available width when needed. On large screens, the hero may split seven and five columns, posters may use uneven spans, and the participation section may split five and seven columns. Do not compress labels below their readable size to preserve the desktop arrangement.

## Finish disposition

Ship. The built route preserves the agreed focal object, location states, optional participation flow, and mobile-first hierarchy.

## Unresolved decisions

The map still needs the public Mapbox token supplied through `NUXT_PUBLIC_MAPBOX_TOKEN` and user-verified public coordinates. `NUXT_PUBLIC_MAPBOX_STYLE_URL` is optional and selects a custom Studio style. Verified public location labels, details, and clues remain data decisions. Do not invent or infer them in the interface.
