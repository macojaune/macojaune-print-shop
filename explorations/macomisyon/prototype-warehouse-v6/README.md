# Dépôt Q · v6

POC Maco’misyon. La v5 et ses preuves restent intactes dans `../prototype-warehouse-v5/`.

## Ouvrir

```sh
npm ci --ignore-scripts
npm start
```

Ouvrir http://127.0.0.1:58017/. Les comptes et contributions restent simulés et stockés dans ce navigateur, avec une clé v6 indépendante.

## Ce qui change

- Accident : éclairage orange/rouge du dépôt, fond brun sombre, grosse balise murale sous cage et gyrophare du Fenwick qui tournent. Un balayage lumineux parcourt le décor. Rotation lente de 5,6 secondes, sans flash brutal.
- Quand Q se relève, la lumière de travail revient progressivement. Son gyro reste actif ensuite.
- À chaque arrivée, l’état acquis se présente par une animation : Q se redresse, les colis rejoignent la palette, le quai se prépare, ou le rideau s’ouvre avant les tournées. Les compteurs et les acquis ne sont jamais remis à zéro et les annonces de réussite ne sont pas répétées.
- Un seul contrôle Pause/Reprendre, également accessible dans la console. Aucun réglage ni libellé « Mode calme ». La prise en compte déjà existante du mouvement réduit système reste interne.

Dans Mode démo, choisir L’accident pour voir l’alerte, Deux missions ouvertes pour relever Q, ou Le dépôt en activité pour la tournée. Pour voir les colis se rassembler, compléter les recommandations après avoir relevé Q. Recharger la page rejoue l’entrée correspondante. Une pause mémorisée affiche directement l’état acquis.

Les prérequis, les contributions reçues avant déblocage, les étapes masquées et le bonus indépendant restent ceux de la v5. Les vraies Komisyon seront définies ensuite.

## Vérification

```sh
npm test
npx playwright install chromium
npm run test:browser
```

Serveur actif requis pour le test navigateur. `DEMO_URL` permet une autre adresse. `verify-v6.cjs` vérifie les gyrophares, la pause, les quatre états d’arrivée, les acquis conservés, le relais vers les tournées et capture les vues mobiles/desktop dans `.impeccable/review/`.

Validation Chromium, sans mesure de performance sur téléphone physique. Aucun service de progression ni PostHog connecté.

## Références

[Gyrophare de chariot SharpEagle](https://sharpeagle.com/product/beacon-light-circular-pattern) et [réflecteur tournant PATLITE](https://shop.patlite.com/Amber-Rotating-Signal-Beacon-p/skh-m2jb-y.htm) pour la direction visuelle. Les mouvements sont ralentis pour ce jeu. Modèles procéduraux dans `props.js`, scène et lumière dans `world.js`, tournée dans `ambient.js`, règles dans `model.js`.
