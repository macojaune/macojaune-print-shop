# Protection des médias Cho Kaché

Le site stocke les signalements dans le bucket R2 `macojaune-web`, sous le préfixe `private/cho-kache/discoveries/`.

Le bucket reste relié à `cdn.macojaune.com` pour les images publiques du site. Ce Worker intercepte uniquement `cdn.macojaune.com/private/cho-kache/*` et renvoie une erreur 404. Les uploads et la lecture côté serveur continuent de passer par l'API S3 de R2.

Déploiement :

```bash
wrangler deploy --config workers/cho-kache-private-guard/wrangler.jsonc
```
