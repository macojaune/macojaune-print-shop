---
version: 1
slug: "route-macomisyon"
primary_target: "route:/macomisyon"
related_targets: ["app/pages/macomisyon/index.vue", "app/components/macomisyon/JarryMap.client.vue", "app/components/macomisyon/DepotQ.client.vue"]
---

# Maco'misyon surface brief

## Scope and mode

This brief governs `/macomisyon`. Its mode is Experience. The geography should feel familiar to someone who knows Jarry, while visitors encounter an unnamed fictional world. Landmarks invite exploration; the warehouse reveals its project only after entry.

## Audience, job and first delivery

The route is for people who follow Marvin's projects and for people who arrive through one of those projects. It must work as an introduction without requiring knowledge of the word Komisyon. This first delivery contains the Jarry-inspired map and an interactive Dépôt Q demo with fictional counters and locally saved progress.

## Direction

Keep the Macojaune black, amber, Tanker and Space Grotesk system. The 3D map is a stylised isometric miniature based on Marvin's two aerial references. Its wide peninsula, scalloped bay, mangrove masses, port, curved industrial corridor and roundabout interchange carry the resemblance. Construction barriers follow the roundabout's seven-o'clock axis in the supplied close-up. Tree canopies leave the interchange ramps visible. No real place names, coordinates, project names or project initials appear outside. The warehouse is the first warm, active point; future places remain quiet pictograms.

The page frames the world as a game console. Markers are compact square pictograms. Selecting one presents an evocative place name and a clue in the dock. The exterior consistently uses "Le hangar", "La maison sur l'eau" and "L'atelier fermé", including accessible labels and the return from the depot. Project identities appear inside. The first dock invites exploration without preselecting a project. The canvas is never the only route to the content. The inherited Depot Q palette extends the portfolio palette locally: dark green controls, mint completed states, warm paper, amber actions and turquoise water. These scene colors do not replace the global portfolio design.

## Motion and accessibility

The island has restrained life: vehicles move slowly, a boat rocks, the crane hook moves and the hangar beacon pulses until repair. Repair changes the exterior signal and starts its delivery vehicle. Reduced motion stops ambient animation and uses an immediate camera change. Keyboard users can select each place through ordinary buttons, using the same anonymous place names as touch users. If WebGL fails, the place list and entry to the depot remain available.

## States and unresolved decisions

QuiLivreOù is the only enterable project in this release. The locations for Shootareas and Zikak offer anonymous clues; their project names and interiors stay hidden. The true global mission data, project positions and thresholds remain open decisions. The initial camera shows the whole territory on desktop and mobile. Mobile visitors zoom to inspect details. Selecting a place moves the camera to zoom 3.6; manual zoom reaches 5.2. Recentring restores the overview and clears the selection. Returning from the depot restores the camera framing saved before entry.
