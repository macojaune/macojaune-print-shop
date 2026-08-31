# Cho Kaché

## La mécanique de participation

Cho Kaché doit fonctionner pour deux personnes différentes : celle qui suit les indices depuis son téléphone et celle qui tombe directement sur un print dans la rue.

### Avant la découverte

1. Macojaune crée un print avec le statut `draft`.
2. Il choisit si la position sera `public` ou `secret`.
3. Il ajoute le lieu public ou les indices qui pourront être diffusés.
4. Il place le print et passe son statut à `active`.
5. Le compteur et la liste publique se mettent à jour.

Un print `draft` ne doit jamais apparaître sur le site. Un print `active` apparaît comme « pas encore trouvé ». Un print `found` sort de la liste active et pourra rejoindre plus tard des archives.

### Les deux niveaux de localisation

#### Lieu public

La page peut montrer le nom du lieu, une zone, des coordonnées et un lien vers l'application de carte. L'emplacement peut être précis ou volontairement approximatif selon le print.

La carte Mapbox affiche uniquement les prints actifs dont la visibilité est `public` et qui possèdent une latitude et une longitude publiques. Le fond utilise le style Standard en monochrome et mode nuit, avec les couleurs Macojaune. Une URL de style Mapbox Studio peut remplacer ce style sans changer les données.

#### Lieu secret

La réponse publique indique uniquement que le lieu est caché. Les coordonnées exactes restent côté serveur. Elles ne doivent apparaître ni dans le HTML, ni dans le JSON envoyé au navigateur, ni dans les métadonnées de la page.

Les indices restent publics et peuvent évoluer sans révéler la position enregistrée.

### Au moment de la découverte

1. La personne photographie ou filme le print dans sa cachette si elle en a envie.
2. Elle scanne le QR code du ticket et arrive directement sur « J'en ai trouvé un ».
3. Le numéro public et le code interne sont préremplis par le QR.
4. Si le QR ne passe pas, elle choisit le numéro public et recopie le code imprimé au dos.
5. Elle peut ajouter un contact, un lieu, sa position GPS et jusqu'à trois photos ou vidéos. Tout cela reste facultatif.
6. Macojaune vérifie le signalement avant de passer la photo à `found`.

### QR code et validation

Chaque ticket possède deux identifiants :

- un numéro public court, comme `Photo n°1`, affiché dans les cartes du site ;
- un code interne aléatoire, comme `CHO-7K4M-9Q2P`, présent uniquement dans le QR et au dos du tirage.

Le QR contient les deux valeurs, par exemple :

```text
https://macojaune.com/cho-kache?photo=1&code=<code-interne>#signaler
```

La page récupère le code puis le retire de l'URL visible. Le serveur vérifie que le numéro et le code correspondent. Le code n'est jamais enregistré dans le signalement et n'apparaît jamais dans les données publiques.

La géolocalisation du téléphone n'est pas nécessaire pour envoyer une découverte. Elle n'est demandée qu'après une action explicite et peut être retirée avant l'envoi.

## Données minimales

### Prints

- numéro public, par exemple `1`
- code interne aléatoire, stocké uniquement dans la configuration serveur
- statut `draft`, `active` ou `found`
- visibilité `public` ou `secret`
- libellé public du lieu
- coordonnées publiques facultatives
- coordonnées secrètes côté serveur
- indices publics
- date de mise en jeu
- date de découverte

### Découvertes

- print concerné
- date du signalement
- contact facultatif
- note de lieu et position GPS facultatives
- photos ou vidéos facultatives
- accord explicite avant toute republication d'un média

## API prévue

`GET /api/cho-kache/prints` renvoie uniquement les données publiques. Le serveur construit une réponse nettoyée et omet systématiquement les coordonnées secrètes.

`POST /api/cho-kache/discoveries` vérifie le numéro et le code interne, puis conserve le signalement et les médias dans `private/cho-kache/discoveries/` sur le bucket R2 existant. Rien n'est publié automatiquement. Le Worker `macojaune-cho-kache-private-guard` bloque ce préfixe sur `cdn.macojaune.com` sans gêner les accès du serveur par l'API R2.

Les codes sont fournis au serveur par `NUXT_CHO_KACHE_INTERNAL_CODES_JSON`. Le script suivant génère les codes et les URL à imprimer sans les écrire dans le dépôt :

```bash
node scripts/generate-cho-kache-codes.mjs 3
```

## Ordre de mise en place

1. Renseigner les vrais identifiants, lieux publics et indices des trois prints déjà cachés.
2. Générer les trois codes internes et configurer `NUXT_CHO_KACHE_INTERNAL_CODES_JSON` en production.
3. Imprimer le numéro public, le code interne et le QR correspondant sur chaque tirage.
4. Ajouter une petite interface privée pour vérifier les signalements et passer un print à `found`.
5. Brancher la liste sur Turso lorsque le nombre de photos ne sera plus pratique à gérer dans le fichier local.
6. Ajouter la galerie des trouvailles seulement après avoir défini la modération et l'autorisation de republication.
