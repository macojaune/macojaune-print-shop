# Relecture du dépôt Q v4

Relecteur indépendant, contexte frais, sans navigateur. Captures Chromium de quatre formats et échantillon des états ; sources et rapport de vérification fournis.

## Première relecture : fix

La panne, les colis au sol, l’inventaire, les compteurs reçus en avance et la transformation finale sont lisibles. Le device desktop et le plein écran mobile conservent la direction approuvée.

Deux corrections demandées :

1. La fiche projet répétait que Q était renversé après sa réparation. Adapter son récit aux acquis.
2. L’aperçu « Accès à l’annuaire » portait une flèche sans être cliquable. En faire un véritable lien accessible au clavier.

Corrections appliquées : récit de départ, Q debout, cargaison rassemblée, quai préparé et départ final ; aperçu lié au vrai annuaire, focus visible. Captures finales `*-project.png` et `*-project-repaired.png`.

## Limites observées

Les petits libellés d’état secondaires restent minuscules à 360 px ; les grands titres et compteurs portent la lecture principale. Les fines stries du sol restent un détail du rendu procédural. Le détecteur a fonctionné en mode regex dégradé : il n’a pas évalué le contraste calculé. Téléphone physique et Safari iOS non vérifiés.

L’avertissement sur les bords inférieurs et petits rayons des boutons ne demande pas de correction : il correspond au langage rétro approuvé.

## Vérification fonctionnelle

17 tests du modèle. Parcours navigateur sur 1280×900, 390×844, 360×740 et 584×1037, puis pincement tactile émulé. Compteurs bloqués, cascade, missions parallèles, bonus, navigation caméra, masquage réappliqué au dock, finale recentrée, restauration sans rejouer les effets et dimensions fixes vérifiés. Aucun test sur appareil physique.

## Verdict sur les corrections : ship

Le relecteur a classé les deux corrections **resolved** : récit adapté aux cinq états et aperçu devenu un vrai lien accessible. Ce verdict porte sur ces deux corrections ; il ne constitue pas une nouvelle revue globale.

Vérification complémentaire : récit avec Q debout, puis boutiques accomplies avant les recommandations ; accès au lien de l’aperçu par tabulation. Ces contrôles passent également.
