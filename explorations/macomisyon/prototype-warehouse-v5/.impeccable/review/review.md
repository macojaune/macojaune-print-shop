# Revue v5 — dépôt en activité

## Périmètre

La v4 approuvée reste intacte. Cette revue concerne la tournée et les activités Three.js, les balises locales et les commandes Pause / Reprendre / Mode calme. Impeccable est réservé aux contrôles de l’interface ; les guides Three.js Animation et Lighting servent de références pour la scène.

## Résultats

- 23 tests de modèle et d’animation déterministe réussis : compteurs indépendants, prérequis, cascade, acquis, continuité des phases et horloges suspendues.
- Régression Chromium aux formats 1280×900, 390×844, 360×740 et 584×1037 : aucune erreur relevée ; cadre fixe, inventaire, indices, clavier, restauration et pincement conservés. Voir `verification.json`.
- Deux tournées observées avec chargement à l’aller et retour vide ; aucune contribution ni annonce de réussite générée par les boucles. Voir `motion-verification.json`.
- Contrôles supplémentaires : changer de scénario pendant une pause affiche l’état acquis ; suspendre une réparation la fige ; le passage au mouvement réduit applique la pose calme avant l’arrêt du rendu, puis reprend depuis cette pose.
- Captures complémentaires au format du navigateur intégré 993×1037 et aux formats mobiles, dont console, pause, aller et retour.

## Revue indépendante

Inspection de `ambient.js`, `world.js`, des contrôles et des captures par un second agent : continuité réparation → quai → retour → nouvelle tournée acceptée, séparation des acquis et de l’animation correcte. Pas d’autre bloqueur. Le bouton Pause a été agrandi de 36 à 44 px pour le toucher.

Un défaut de synchronisation du changement système a été trouvé puis corrigé : la valeur de la media query pouvait être lue avant la réception de son événement. Une synchronisation idempotente applique désormais le mode calme depuis le rendu, le contrôle et l’événement.

## Limites

Tests sur Chromium, rendu WebGL logiciel pour l’automatisation. Pas encore de mesure sur téléphone physique ni de validation Safari iOS. 30 images/s est le plafond de l’ambiance, pas une performance mesurée sur mobile. La lumière d’alerte varie progressivement sur 5,6 secondes, l’éclairage général reste stable ; aucune analyse spécialisée de photosensibilité n’a été effectuée. Le coût des ombres et des étiquettes sera à mesurer sur un vrai appareil avant une optimisation supplémentaire.

Les captures de régression ont précédé les dernières corrections ciblées de pause et de taille du bouton ; les vues principales et le test des commandes documentent leur état final. Tous les objectifs restent simulés dans ce navigateur.
