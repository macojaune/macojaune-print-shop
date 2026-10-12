---
version: 1
slug: "route-macomisyon"
primary_target: "route:/macomisyon"
related_targets: ["app/pages/macomisyon/index.vue", "app/components/macomisyon/JarryMap.client.vue", "app/components/macomisyon/DepotQ.client.vue", "app/components/macomisyon/MemeBank.client.vue"]
---

# Maco'misyon surface brief

## Scope and mode

This brief governs `/macomisyon`. Its mode is Experience. The geography follows the real Jarry footprint, while visitors encounter an unnamed fictional world. Landmarks invite exploration; project identities appear only inside their buildings.

## Audience, job and first delivery

The route is for people who follow Marvin's projects and for people who arrive through one of those projects. It must work as an introduction without requiring knowledge of the word Komisyon. The current local version contains four exterior places and two interactive interiors, Dépôt Q and Memebank, with fictional counters and locally saved progress. The larger territory makes room for the 13 identified projects; nine additional places have not been implemented or assigned final locations.

## Direction

Keep the Macojaune black, amber, Tanker and Space Grotesk system. The 3D map is a stylised isometric miniature covering the complete approved extent from La Jaille to the tip and port, with the mangrove and coastline. The terrain uses real OpenStreetMap polygons and road lines from July 2026 snapshots, collected on 12 October. Preserve the peninsula, bays, channel, islets, port, roads and vegetation footprints. Crop boundaries must remain crop boundaries, never invented coastline. Tree canopies and fictional project buildings must leave the road network visible and connected. No real place names, coordinates, project names or project initials appear outside. The warehouse remains the first warm, active point.

The [geographic source record](../../docs/macomisyon-geography-sources.md) documents the July snapshot dates, ODbL licence, preparation and limits. Keep the visible OpenStreetMap attribution and its link. The 1,500 selected building footprints are simplified source geometry, not a complete inventory. Ordinary building heights, pastel roofs, faceted trees, port props and project buildings are stylised. Preserve horizontal proportions at 20 metres per scene unit. The miniature must remain recognisable without treating its volumes as measured current conditions.

The page frames the world as a game console. Markers are square pictograms with 46 × 46 px targets. Selecting one presents an evocative place name and a clue in the dock. The exterior consistently uses "La banque", "Le hangar", "La maison sur l'eau" and "L'atelier fermé", including accessible labels and the return from either interior. Project identities appear inside. The first dock invites exploration without preselecting a project. The canvas is never the only route to the content. The inherited Depot Q palette extends the portfolio palette locally: dark green controls, mint completed states, warm paper, amber actions and turquoise water. These scene colors do not replace the global portfolio design.

## Motion and accessibility

The territory has restrained life: vehicles move slowly, a boat rocks, the crane hook moves and the hangar beacon pulses until repair. Repair changes the exterior signal and starts its delivery vehicle. Reduced motion stops ambient animation and uses an immediate camera change. Keyboard users can pan with the arrow keys, zoom with +/−, reset the view with Home and select each place through ordinary buttons. The anonymous place names are the same for keyboard and touch users. If WebGL fails, the place list and entry to the depot remain available.

One-finger dragging pans in X/Z without changing the ground height. Two-finger pinching changes zoom. Dragging from a marker must also pan, without selecting it on release. Keep the camera target inside the geographic bounds. At overview scale, hide conflicting markers instead of shrinking their touch targets. Give the selected place priority and keep all four places reachable through the ordinary list.

## States and unresolved decisions

QuiLivreOù is initially enterable. Memebank is the second interior, behind a simulated curiosity milestone. The locations for ShootAreas and Zikak offer anonymous clues; their project names and interiors stay hidden. Real mission data, production thresholds and the nine future places remain open decisions. The initial camera fits the whole geographic extent on desktop and mobile. Manual zoom ranges from 0.6 to 24; selecting a place adapts the focus to the available width and height. Recentring restores the overview and clears the selection. Returning from either interior restores the camera framing saved before entry.

Local validation of the 12 October change passed: 84 unit tests, 33 browser checks, nine visual states and the Nuxt build. The bank and warehouse forecourts were relocated and recaptured clear of the roads. Port container batches were removed and crane feet repositioned; the final compiled bundle was exercised on desktop and mobile, including a port inspection through real pan and zoom controls. The [validation record](../../docs/macomisyon-jarry-validation.md) separates these passes and their limits. There is no remote deployment or physical-phone performance claim. The old fixed focus of 3.6 and manual maximum of 5.2 describe the previous smaller map only.

## Historical direction and interior references

The dated sections below preserve the decisions and evidence for the bank and its interiors. Their miniature materials and discovery rules still apply. Their older aerial-reference geography and exterior placement do not override the current OSM terrain. See the [geography brief](../../docs/macomisyon-jarry-geography.md) for the current boundary and the historical aerial references.

## Direction contract — Memebank, 1 October 2026

THESIS: “Le casse du sérieux”, refined by Marvin into a diversion: bury both clerks in paperwork so they do not notice the vault opening. The bank treats an absurd project with bureaucratic gravity; real project milestones, not a realistic theft, change the miniature.

OWN-WORLD: Inherit the isometric low-poly coast, paper stone, dark green ink, amber, Tanker and Space Grotesk. Four columns and a triangular pediment distinguish the anonymous exterior. No project name outside. No new global visual identity.

STORY: Curiosity opens the hall (outside the three interior steps). Étape 1 is the newsletter/mail counter; Étape 2 is the applications desk; Étape 3 is the VHS vault. Both clerks stay at their desks, distracted by increasing piles and waiting clients. Mail and dossiers continue growing after their quotas, not merely their counters. Qualification and invitations stay separate. Only an explicit beta-opening event opens the vault onto shelves and stacks of VHS tapes: no tester lounge, cash or gold. Recognizable VHS cases, with short readable paper labels, spill from the full vault and settle around the yellow carpet. Newsletter and applications progress independently.

FIRST VIEWPORT: Existing coastal map with one added bank west of the bridge. Inside, a spacious cutaway with three anchored numbered hotspots (Étape 1 / 2 / 3), a bottom status/inventory dock, and the SAME mission/inventory/scenario panel styles as the hangar. No permanent side ledger. Mobile uses a compact bottom panel while keeping the selected station visible. Zoom, pan and station focus expose the details. A short-lived reaction leaves a persistent prop change.

FORM: Local extension of the approved Three.js experience, code-led. No concept seed: user-selected bank metaphor and “Le casse du sérieux”, not a replacement world. Curiosity gate confirmed; all thresholds and actions are labelled local simulations.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## VHS refinement — approved base saved first

The approved bank remains recoverable at commit `2f0d480`, tag `macomisyon/13-memebank-diversion`. Refinement is restricted to the VHS object and its opening sequence: real cassette proportions, molded dark case, two recessed tape windows, a readable “MÈMES” label and a small “VHS” mark. No changes to the three steps, shared hangar UI, clerks, queues, mission rules or exterior.

Motion plan: the vault opening is the focal moment. Seven tapes tip, fall in a short cascade and settle at different angles near the runner, instead of one ceremonial object. Replace the generic paper confetti at this moment with the cassettes themselves. Keep the current opening duration, state continuity and explicit beta trigger. The models are allocated once, rigid meshes batched per material, with no extra simulation loop or physics dependency. Reduced motion, pause, hidden pages and a restored open state jump directly to the same settled arrangement. Inspect final desktop/mobile views together, correct in one batch if necessary, then confirm once.

## Memebank boundaries

The Drive source is section 25 of https://drive.google.com/file/d/1JGOO_S5Ht72q_g-UE3ZMAHN6rTAYkUq6/view, read via existing Drive CLI authentication on 1 October 2026. No real campaign tracking, newsletter submissions, applicant admission, notifications, publication, financial transactions or Zikak points. No automatic beta access at a form quota. Textual access, keyboard controls, pause, reduced motion and WebGL fallback remain first-class. Paper geometry and queue length are bounded for performance; over-goal bulk height continues to grow logarithmically, and actual counts never stop at a quota. Illustrative quotas: 10 attributed visits, 8 subscriptions, 5 received applications; not approved production goals.

## Comparaison d’extension — Memebank après le correctif mobile

**Statut documentaire historique : extension ordinaire, mode Experience inchangé.** La [référence littorale précédente](<docs/macomisyon/versions/12-monde-littoral-v2/desktop.png>) conserve son rôle pour les matériaux : miniature isométrique, eau turquoise, pierre claire, végétation et console sombre aux accents jaunes. Sa géographie composée a été remplacée par l'extrait OSM du 12 octobre. L’[extérieur de la banque](<.impeccable/review/bank/exterior-open.png>) ajoute une silhouette à colonnes et fronton, avec un indice de bobines, sans révéler le nom du projet. Il s’agit d’un agrandissement du monde, pas d’un nouveau concept, comp ou seed.

**Comparaison avec le hangar.** Les deux intérieurs chargent la même [feuille de styles](<app/assets/css/macomisyon-interior.css>) via [Dépôt Q](<app/components/macomisyon/DepotQ.client.vue#L231>) et [Memebank](<app/components/macomisyon/MemeBank.client.vue#L200>). Les panneaux sombres, jauges, grands compteurs, dock, inventaire et scénarios sont hérités. La banque n’a plus de registre latéral permanent. Ses ajouts locaux servent les trois postes, la sélection explicite des candidatures et le débordement ; ils ne constituent pas une nouvelle identité. La [note d’observation](<DESIGN.md#L149>) consigne cette variante commune sans toucher au frontmatter ni aux règles globales.

**Comparaison des états.** L’[intérieur de départ](<.impeccable/review/bank/interior-start.png>) distingue les trois points Étape 1/2/3 dans une salle élargie. Les [objectifs dépassés](<.impeccable/review/bank/beyond-goals.png>) montrent davantage de papier et de clients autour des deux employés restés à leurs bureaux. La [vue du coffre ouvert](<.impeccable/review/bank/vault-vhs-open.png>) montre des rayons de VHS et une cassette dégagée sur le tapis. Le [calcul de charge](<app/lib/macomisyon/bank/progression.js#L8-L25>) borne les objets individuels mais fait continuer la hauteur compactée logarithmiquement après quota. Newsletter et formulaires restent indépendants ; qualification, invitation et ouverture bêta sont des décisions simulées distinctes, sans action réelle, conformément au [concept](<docs/macomisyon-banque-concept.md#L79-L96>).

**Dernier correctif confirmé sur captures fraîches et parcours navigateur.** Sous 700 px de viewport CSS, la [fiche de banque](<app/components/macomisyon/MemeBank.client.vue#L223-L230>) est plafonnée à `min(300px, calc((100% - 132px) * .46))` : 46 % au plus de la vraie zone 3D, après retrait du dock, non 46 % de tout l’écran. Le contenu reste défilant, les commandes de zoom se rangent en haut lorsque le panneau est ouvert, et les marqueurs sont masqués pendant la fiche mission pour laisser voir les piles. Le shell conserve sa hauteur d’écran et son dock fixe dans la console. Les cibles des commandes intérieures et marqueurs restent d’au moins 44 px, avec focus clavier, pause, mouvement réduit et accès textuel sans WebGL présents en source.

Le [cadrage d’inspection](<app/lib/macomisyon/bank/world.js#L931-L961>) projette les limites du poste, des piles et des personnes dans le rectangle libre, au lieu de centrer seulement un point. À partir de 1120 px de largeur de canvas, le cadrage desktop reste inchangé. En dessous, le choix fiche basse / panneau latéral suit le même seuil de viewport CSS que l’interface : moins de 700 px réserve la hauteur de fiche et les commandes hautes ; sinon, le cadrage réserve le panneau latéral. Le cas 740 px de viewport, dont le canvas est plus étroit, est vérifié séparément. **Réserve CSS et réserve de caméra restent un couple à maintenir en synchronisation.** Le [debug d’inspection](<app/lib/macomisyon/bank/world.js#L1198-L1213>) expose rectangle libre et coins projetés pour vérifier que le poste sélectionné est visible.

**Limites des preuves reçues.** Les captures [mobile-mission](<.impeccable/review/bank/mobile-mission.png>) et [mobile-ledger](<.impeccable/review/bank/mobile-ledger.png>) ont été signalées comme précorrectif : elles ne certifient pas le dernier batch. La confirmation mobile et le build isolé restent à la charge du Lead ; aucun nouveau navigateur, serveur ou test n’est lancé par cette passe. Les 77 tests unitaires, 11 contrôles banque, 10 contrôles hangar/carte et le build Nuxt PASS communiqués précèdent la dernière correction. Le [registre documentaire](<.impeccable/review/bank/documentation-review.md>) détaille les lectures et les limites de fraîcheur. L’absence préexistante de `.impeccable/design.json` est signalée sans réparation ; le CLI refusé avec le code 126 ne fournit aucun score.
