# 14 — VHS détaillées et coffre débordant

Variante locale **approuvée le 1er octobre 2026**, sauvegardée sous le tag `macomisyon/14-vhs-debordantes`. La base précédente reste disponible au commit `2f0d480`, tag `macomisyon/13-memebank-diversion`. Aucun push ni déploiement.

- Coques VHS fines et biseautées, joint et détails moulés.
- Deux fenêtres fumées, ruban brun-noir, petits moyeux dentés.
- Grande étiquette « MÈMES », marquage « VHS », lisibles en zoom.
- Sept cassettes chutent en cascade, basculent, rebondissent légèrement puis glissent : trois sur le tapis, quatre sur le sol.
- Les 35 VHS des rayonnages et piles restent dans le coffre ; nombre illustratif, pas un catalogue réel.
- Même pose finale après pause, mouvement réduit ou rechargement.
- Étapes, panneaux, objectifs, employés, clients et extérieur conservés.

## Captures réelles

- [Gros plan des cassettes et des étiquettes](<docs/macomisyon/versions/14-vhs-debordantes/detail.png>).
- [Le coffre débordant dans la banque](<docs/macomisyon/versions/14-vhs-debordantes/desktop.png>).
- [Les VHS restent visibles avec la fiche mobile](<docs/macomisyon/versions/14-vhs-debordantes/mobile.png>).

Images capturées par Playwright du rendu réel, pas des images de concept. Copies aux pixels vérifiés identiques, avec provenance embarquée en métadonnées. Aucun raster ajouté au frontend : la texture des VHS est dessinée par Canvas, partagée et gérée par la scène.

84 tests unitaires et 12 parcours banque passent après le dernier correctif. La compilation et le smoke test de production sont consignés dans la [reprise technique](<docs/macomisyon-integration.md>).

[Concept et règles](<docs/macomisyon-banque-concept.md>) · [Base approuvée sauvegardée](<docs/macomisyon/versions/13-memebank-diversion/README.md>)
