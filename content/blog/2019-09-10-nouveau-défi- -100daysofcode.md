---
title: "Nouveau Défi: #100DaysOfCode"
date: 2019-09-10T19:00:00.000+00:00
author: macojaune
layout: post
permalink: "nouveau-defi-100-days-of-code"
image: "/pictures/2019/09/code.png"
draft: false
categories:
- geek
- web
- développement
- défi

---
Il reste moins de 120 jours avant la fin ~~du monde~~ de l'année. Et j'ai trouvé que c'était le bon moment pour me lancer un nouveau défi :  #100DaysOfCode.

C'est un défi très populaire dans le monde entier, les développeurs pro ou amateurs s'y donnent a cœur joie, on peut voir l'activité du Hashtag sur Instagram ou Twitter c'est la folie.

Le principe de ce challenge ([http://100daysofcode.com](http://100daysofcode.com)) est simple, **coder au moins 1H tous les jours pendant 100jours**.

Ma version est un peu particulière car je code déjà casiment tous les jours, c'est mon boulot après tout.  (_Oh t'as un boulot toi maintenant ?)_

Ahah. Hilarant. Oui, du coup j'ai ajouté une variante au challenge :

##### Coder au moins 1H par jour **POUR MOI** durant 100 jours d'affilée.

J'ai aussi décidé de faire cette session de code en live sur Twitch ([https://twitch.tv/macojaune](https://twitch.tv/macojaune)) et de partager le live sur Youtube une fois terminé ([https://youtube.com/macojaune](https://youtube.com/macojaune)). (_C'est bon t'as fini la publicité la ?)_

Pour le moment. :)

# Jour 1 : On commence par quoi ?

Très bonne question Marcel.  
On va commencer par **QuiLivreOù?** ([http://quilivreou.fr](http://quilivreou.fr)), c'est un site que j'ai lancé il y a facilement 5 ans de cela, et qui n'a pas bougé depuis.

## Le but ?

Lister les sites et boutiques qui livrent vers les antilles _(et ailleurs)._

_  
_On est souvent heurté au problème du "Impossible de livrer cette destination" après avoir rempli son panier, sorti sa carte et cliquer sur valider la commande.  
Dès qu'on arrive sur le formulaire d'adresse de livraison, on croise les doigts pour trouver son Île dans la liste déroulante, et surtout, **SURTOUT**, pour que le prix à coté du transporteur soit **inférieur** au prix de la commande (_c'est rare_).

J'ai voulu lancer ce projet le plus vite possible une fois l'idée suffisamment mure dans mon cerveau.

Du coup j'ai pris un nom de domaine, créé un wordpress, mis un thème, craché deux trois lignes, créé un logo super rapide (_moche_), choisi une charte graphique sur un site (_bleu blanc rouge, quelle originalité_) et c'était bon.

Ce qui m'a pris le plus de temps (un samedi), était de créer la page spécifique et le script PHP associé, pour permettre à n'importe qui d'ajouter un site.

C'est un formulaire (_moche_) qui permet d'ajouter un nouveau site à la plateforme. Une fois validé, le script créé un nouvel article Wordpress, récupère l'aperçu du site via un API (apercite), ajoute les infos du formulaire au contenu pré-formaté. Et voila !

Un nouveau brouillon créé. Oui pour l'instant je valide à la main pour éviter doublons et erreurs de saisies.

## Qu'est-ce qu'on en fait ?

**On retape tout !**

Vous connaissez mon allergie a Wordpress, je veux retaper l'intégralité du site avec des technos modernes.

La session a débuté avec la recherche de framework/stack et j'ai fini par décider de partir sur[ Nuxt.js](https://nuxtjs.com) qui permet de générer un projet [Vue.js](https://vuejs.org) complet prêt à l'emploi.

J'ai choisi Hapi.js pour gérer le backend et Ant design pour le framework UI.

Ce projet va me permettre d'apprendre pas mal de choses, et j'aime bien ce type de défi.  
Après tout c'est ça d'être développeur non ? Sans cesse apprendre de nouvelles choses. Chercher, Enquêter… Et ça c'est une grande passion du Maco ahah.

On se revoit dans un nouvel article dès qu'on a un peu de nouveautés ?
