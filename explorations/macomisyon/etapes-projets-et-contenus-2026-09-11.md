# Maco’misyon : étapes par projet et contenus à anticiper

11 septembre 2026. Première trame de travail, à partir de la dernière orientation de Marvin. Les étapes ci-dessous sont des propositions ; leur ordre, leurs critères et leur statut éventuel de Komisyon restent à préciser. Elles ne décrivent pas des fonctionnalités ou contenus déjà prêts.

## Direction confirmée

Commencer par chaque projet pour identifier des étapes concrètes. Examiner ensuite leurs dépendances, les conditions de passage et la représentation d’ensemble. La notion d’aventure reste en suspens.

Le contenu participe au fonctionnement du jeu. Il peut amorcer Maco’misyon, présenter des choix, recueillir une action qui ouvre la suite ou annoncer une nouvelle mission. Il peut aussi être la conséquence d’un objectif atteint.

Deux exemples donnés par Marvin : dix commentaires contenant une lettre peuvent déclencher une vidéo ; des commentaires exprimant une préférence entre QuiLivreOù et Shootareas peuvent déterminer quelle présentation vient ensuite. Ces mécanismes sont des exemples, pas encore des règles publiées.

## Nouvelle piste : deux projets accessibles, une première communication

Marvin propose de rendre QuiLivreOù et Shootareas accessibles en même temps, tout en communiquant initialement sur un seul. La page Maco’misyon et une page liens affichant la mission en cours et son avancement existent dès ce départ. Les personnes curieuses peuvent ainsi explorer et accéder au second projet avant sa présentation sur les réseaux.

Un seuil de visites sur une durée donnée pourrait déclencher la vidéo préparée du second projet, avec une annonce du type « Komisyon activée : des curieux ont découvert le projet, je vous le présente ». Un seuil portant sur Maco’misyon lui-même pourrait déclencher la vidéo de présentation du concept global. C’est une piste de lancement en discussion, pas une instruction de publier maintenant les sites ou les contenus.

### Étapes de ce scénario

| Étape | Ce que voit le public | Ce qui doit être prêt |
| --- | --- | --- |
| Les deux projets deviennent accessibles | Deux projets utilisables ou consultables selon leur état réel. | Leurs parcours de découverte, le hub et les mesures nécessaires vérifiés. |
| La page liens accompagne le départ | La Komisyon mise en avant, sa progression et un accès à Maco’misyon. | Un affichage relié au véritable état de la mission. |
| Un premier projet est présenté sur les réseaux | La vidéo du projet mis en avant et une invitation à le découvrir. | Cette vidéo et les contenus des branches alternatives validés. |
| Des visiteurs explorent Maco’misyon | Les éléments déjà accessibles de l’univers et une possibilité de découvrir le second projet. | Le second projet présent dans le parcours ; la présentation à venir ne conditionne pas son accès initial. |
| La découverte du second projet franchit le seuil retenu | Une conséquence s’apprête à se produire. | Une règle de mesure, une durée et un seuil définis ; la vidéo correspondante prête. |
| Le second projet est présenté | La vidéo préparée paraît et sa Komisyon peut être mise en avant ou ouverte selon la règle retenue. | Le contenu effectivement publié et l’état de la page liens/hub synchronisé. |

### Deux mesures pour deux récits

- **Découverte du projet 2** : mesurer un accès à sa fiche ou une arrivée sur le projet, avec une provenance Maco’misyon identifiable si cette provenance fait partie du récit. Un clic sortant exprime une intention, pas la preuve que la page de destination a chargé.
- **Curiosité pour Maco’misyon** : mesurer les visites pertinentes sur la page du concept pour déclencher son contenu de présentation. Le trafic général d’un ancien article ou de la galerie n’établit pas à lui seul cette curiosité.

Pour les deux règles, les variables restent N visiteurs mesurés et T durée. Aucun seuil chiffré ni délai n’est choisi. La définition de visite, le décompte des visiteurs distincts et la fenêtre fixe ou glissante devront être explicités. Les données recueillies ne sont pas un recensement parfait des personnes ; les tests internes, visites répétées et automatismes doivent être traités dans la mesure retenue.

### Ce que PostHog permet selon la documentation vérifiée

Les insights Trends permettent de compter les utilisateurs uniques, filtrer des événements par propriétés et choisir une période. Les alertes acceptent des seuils et des destinations webhook. Cela peut fournir le signal à notre mécanisme de déblocage et de publication ; ce n’est pas une publication vidéo directement fournie par une mesure analytique.

Sources : [PostHog, Trends](https://posthog.com/docs/product-analytics/trends/overview), [PostHog, Alerts](https://posthog.com/docs/alerts).

La disponibilité et la fréquence de vérification doivent être confirmées sur le compte utilisé. Une publication doit se déclencher une seule fois par contenu, même si le seuil reste dépassé ou si une notification est rejouée. Une réussite observée reste mémorisée quand la fenêtre de trafic se déplace. Si plusieurs contenus deviennent disponibles ensemble, leur ordre de publication doit rester maîtrisable. Le système distinguera le seuil atteint de la publication effectivement réussie.

### Vérification ciblée de l’existant Macojaune

Lecture du code local, sans vérification des services déployés :

- La page liens est [app/pages/link.vue](/Users/marvinl/Documents/DEV/macojaune-web/app/pages/link.vue:372), route /link, et ses liens éditoriaux viennent de [content/links.yaml](/Users/marvinl/Documents/DEV/macojaune-web/content/links.yaml:1).
- Ses cartes de liens ne portent pas de modèle de progression de Komisyon. Elle propose aussi deux accès à des fiches de projets photo.
- Le code inspecté envoie des clics LinkClick et LinkHubClick à Umami via [umami-tracking.client.ts](/Users/marvinl/Documents/DEV/macojaune-web/app/plugins/umami-tracking.client.ts:58). Aucune intégration PostHog n’a été retrouvée dans ce périmètre.
- Aucune route Maco’misyon ni fiche QuiLivreOù/Shootareas n’a été retrouvée dans le périmètre inspecté. Ces éléments restent donc à préparer avant de tester le parcours proposé.

### Contenus à anticiper pour cette piste

Préparer la vidéo du premier projet, celle du second et une présentation du concept global. Pour le second projet, le contenu principal peut rester identique et recevoir une introduction adaptée au déclencheur effectivement observé. Une trame peut traiter la découverte spontanée ; une autre peut présenter le projet à l’initiative de Marvin. Les quantités et les affirmations sur le public seront appuyées sur les faits recueillis.

Cette nouvelle piste conserve le choix entre projets et les seuils de commentaires comme autres mécanismes possibles. Ils n’ont pas besoin d’intervenir tous dans la même séquence de lancement.

## Première proposition d’amorce, conservée comme variante

| Étape | Rôle du contenu | Préparation |
| --- | --- | --- |
| Annoncer Maco’misyon | Montrer l’envie de faire vivre les projets avec le public et donner un aperçu concret de la participation. | Une annonce dans la voix de Marvin, quelques aperçus réels des projets, une promesse compréhensible. |
| Présenter le premier choix | Donner assez de matière sur QuiLivreOù et Shootareas pour choisir lequel découvrir en premier. | Deux mini-pitches comparables, une consigne de participation et l’effet précis du résultat. |
| Présenter le projet choisi | Montrer son intérêt et ce qui existe réellement, puis inviter à la première participation. | Une présentation prête pour chacun des deux résultats possibles. |
| Ouvrir la première étape participative | Donner une action simple et annoncer ce qu’elle peut déclencher. | Le parcours utilisable, le contenu suivant et un moyen de vérifier les participations. |

Dans ce premier scénario, le choix public porte sur l’ordre de présentation et l’ouverture de la première étape correspondante. Il ne vaut pas abandon de l’autre projet. Le contenu non sélectionné reste disponible pour une occasion ultérieure.

L’annonce et les mini-pitches doivent permettre de comprendre pourquoi participer avant tout seuil. Le déblocage d’un contenu supplémentaire peut ensuite donner envie d’aller plus loin.

## QuiLivreOù : étapes candidates

| Étape | Résultat recherché | Contribution possible du public | Contenu à anticiper |
| --- | --- | --- | --- |
| Faire découvrir QuiLivreOù | Les personnes comprennent à quel besoin le projet répond. | Questions, réactions et intérêt pour la suite. | Pitch, démonstration réelle et aperçu de la prochaine étape. |
| Inviter les premiers utilisateurs | Des personnes concernées essaient le service. | Utiliser le site pour une recherche réelle et signaler ce qui aide ou bloque. | Invitation à tester, parcours concret et explication des retours attendus. |
| Atteindre les dix inscrits | Le seuil de dix inscriptions réelles est atteint, selon un critère à définir. | S’inscrire si le service est utile, ou le faire découvrir à une personne concernée. | Annonce de l’objectif, état du compteur et contenu de réussite préparé. |
| Recueillir les premiers retours | Des usages réels font apparaître une amélioration utile. | Décrire une recherche, un manque ou une difficulté. | Sollicitation ciblée, exemples de retours attendus, bilan à produire à partir de ce qui sera réellement reçu. |
| Enrichir l’annuaire | De nouvelles boutiques pertinentes sont vérifiées et ajoutées. | Proposer des boutiques ou des corrections. | Appel à contributions, exemples acceptables, présentation des ajouts confirmés. |
| Trouver un sponsor | Un sponsor est acquis, selon un critère explicite. | Recommander un contact ou faciliter une mise en relation. | Présentation du projet et de la proposition de partenariat ; trame d’annonce à compléter seulement après résultat réel. |

Les étapes de test, d’inscriptions, de retours et d’enrichissement pourront éventuellement coexister. Aucune obligation de finir les dix inscriptions avant de recevoir un retour, ni de finir les retours avant de chercher un sponsor, n’est décidée.

## Shootareas : étapes candidates

| Étape | Résultat recherché | Contribution possible du public | Contenu à anticiper |
| --- | --- | --- | --- |
| Faire découvrir Shootareas | Les personnes comprennent l’intérêt du repérage de lieux pour les prises de vue. | Questions et intérêt pour l’usage présenté. | Pitch, démonstration de ce qui existe réellement, exemples visuels partageables. |
| Choisir un premier lieu à explorer | Un lieu est retenu parmi des options proposées par Marvin. | Exprimer une préférence ou suggérer une piste. | Aperçus des lieux proposés, raisons de les explorer et annonce du choix. |
| Éprouver le repérage sur le terrain | Une exploration ou séance permet de confronter le repérage à la réalité. | Participer si cela est prévu, proposer un angle ou partager une expérience du lieu. | Préparation de la sortie, traces captées sur place, récit et images après l’expérience. |
| Documenter le lieu | Les informations et images utiles deviennent disponibles. | Compléter ou corriger les informations avec des éléments vérifiables. | Présentation du lieu documenté et appel à compléments ciblés. |
| Faire contribuer d’autres personnes | De nouveaux lieux proposés par le public sont documentés. | Proposer des spots et des informations utiles. | Appel à contributions, exemple de fiche attendue et présentation des ajouts. |
| Faire naître une collaboration | Une proposition aboutit à une séance ou création commune réalisée. | Se proposer ou mettre en relation des personnes intéressées. | Invitation claire, préparation avec les personnes retenues, puis résultat réel de la collaboration. |

Cette trame propose des étapes et des contenus. L’état actuel de Shootareas, les moyens de contribuer et la disponibilité des lieux doivent être vérifiés avant de transformer ces étapes en promesses publiques.

## Anticiper les branches ouvertes au public

Pour le choix QuiLivreOù / Shootareas, préparer avant publication :

- Les deux mini-pitches nécessaires au choix.
- La présentation de chacun des deux projets, prête à diffuser et validée par Marvin.
- Une première action réellement faisable après chaque présentation.
- La conséquence annoncée de cette première action.
- Une esquisse de l’étape suivante pour savoir comment poursuivre.

La profondeur de préparation suit les possibilités effectivement ouvertes au public. La prochaine conséquence promise doit être prête. Les étapes plus lointaines peuvent rester au stade de l’intention, du script ou des plans à tourner.

Pour les contenus qui dépendent d’un résultat inconnu, préparer la structure et les éléments réutilisables. Le témoignage, le bilan ou l’annonce de réussite sera complété à partir des faits obtenus. Un contenu préparé ne préjuge pas de l’issue.

## Associer chaque étape à sa préparation

Fiche de travail proposée, à renseigner progressivement :

- Le projet concerné et l’étape.
- Ce que voit le public.
- L’action proposée au public.
- Le résultat ou événement attendu.
- Le contenu ou l’étape qui pourrait suivre.
- Les éléments à préparer avant d’ouvrir cette possibilité.
- L’état du contenu : idée, script, matière captée, montage, validation, prêt ou publié.
- Ce qui reste incertain, notamment dans le produit ou sur le terrain.

Cette fiche sert à anticiper. Elle ne crée pas un nouveau niveau dans le jeu.

## Critères à traiter après la liste d’étapes

Les étapes sont à examiner avant de fixer les règles transversales. Pour les interactions sociales, il faudra notamment préciser :

- La différence entre un seuil à atteindre et un choix qui doit être départagé.
- Le début et la fin d’une participation ou d’un vote.
- Les comptes et publications pris en compte.
- Le traitement des commentaires répétés, des égalités et d’une participation faible.
- Le délai annoncé entre le résultat et sa conséquence.
- Le mode de vérification réellement disponible, manuel ou automatisé selon le canal.
- Les dépendances réelles de l’étape suivante et les évolutions déjà survenues côté projet.

Les capacités actuelles de collecte et de publication devront être vérifiées sur les réseaux choisis. Le prototype Zikak inspecté précédemment ne constitue pas une garantie de détection immédiate ou exhaustive des commentaires.

## Prochaine étape de travail

Corriger ou compléter ces étapes de QuiLivreOù et Shootareas selon les intentions de Marvin. Puis établir, pour les étapes retenues, l’inventaire des éléments existants et des contenus à produire. Les liens, blocages et critères de passage seront définis sur cette base.
