---
id: 236
title: "Komodo IDE v11 : Un logo Jaune ok, mais est-il efficace ?"
date: 2018-05-10T14:35:58+00:00
author: MarvinL
layout: post
guid: http://jauneattitude.fr/?p=236
permalink:  komodo-ide-v11-logo-jaune-ok-efficace/
xyz_fbap:
  - "1"
dsq_thread_id:
  - "6663604111"
dsq_needs_sync:
  - "1"
image: /pictures/2018/05/komodo.png
draft: false
categories:
  - Développement
  - Geekeries
tags:
  - IDE développement code developpeur codeur
  - logiciel
  - review
  - software
  - test
---
<div class="current markeddown hide-on-edit js-card-desc js-show-with-desc" dir="auto">
  <p>
    Et oui, j&rsquo;ai aussi décidé d&rsquo;écrire sur les différents logiciels que je teste, parce qu&rsquo;en tant que Super Maco Jaune, j&rsquo;en teste plein.<br /> On commence par un Éditeur de Texte, les non-initié au monde très sombre du développement, oui vous la qui appelez ça le CODAGE…
  </p>
  
  <p>
    <strong>Beurk!</strong>
  </p>
  
  <p>
    Vous pouvez donc nous quitter dès cette phrase. Merci.<br /> Alors les amis maintenant qu&rsquo;on est entre nous, parlons franchement.
  </p>
  
  <p style="text-align: center;">
    Un <strong>BON</strong> IDE polyvalent − <del>comme moi…</del>. C&rsquo;est RARE, genre Hyper Rare.
  </p>
  
  <p>
    Cela fait quelques mois que j&rsquo;utilise le superbe IDEA d&rsquo;IntelliJ en gros c&rsquo;est la version All-In-One de WebStorm, PhpStorm, Pycharm etc… que vous connaissez surement à l&rsquo;unité.<br /> Je l&rsquo;ai adopté après tests et paramétrages et depuis je ne trouve rien d&rsquo;aussi bon.
  </p>
  
  <p>
    On va prendre quelques critères qui me sont essentiels:
  </p>
  
  <ul>
    <li>
      La polyvalence
    </li>
    <li>
      L&rsquo;autocompletion
    </li>
    <li>
      Les fonctions supp/comp-lémentaires
    </li>
    <li>
      La consommation
    </li>
  </ul>
  
  <h2>
    Polyvalence
  </h2>
  
  <p>
    Selon le site, il devrait s&rsquo;adapter à tous les langages, dans la pratique j&rsquo;ai été un peu déçu. J&rsquo;écris cette partie après l&rsquo;avoir désinstallé <em>(oups, <strong>spoiler alert !</strong> Bon faites moi plaisir et continuez à lire l&rsquo;article) </em>et déjà oublié. Disons que j&rsquo;ai apprécié le fait qu&rsquo;il reconnaisse et stylise mes différents types de fichiers. Parcontre il me semble avoir été troublé quand différents langages se retrouvaient dans le meme fichier, du php avec du js par exemple et qu&rsquo;un des deux n&rsquo;était pas «reconnu» en gros.
  </p>
  
  <p>
    Bref je me souviens ne pas avoir apprécié certaines choses a ce niveau et du coup… c&rsquo;est un no-go.
  </p>
  
  <h2>
    AutoComplétion
  </h2>
  
  <p style="text-align: center;">
    Non, l&rsquo;ami, non.
  </p>
  
  <p style="text-align: justify;">
    Hélas, je regrette mais c&rsquo;est abominable. J&rsquo;ouvre un nouveau dossier rempli de code. Il me propose meme de scanner ce dossier, découvre tout seul les langages utilisés et met les icones qu&rsquo;il faut dans la liste et tout. Et ? ET ? EEET ? Rien, pas de complétion, pas de recherche de chemin, meme pas un Ctrl+Clic pour m&rsquo;amener sur le fichier du chemin en question, ou l&rsquo;endroit ou est défini ma fonction.<br /> C&rsquo;est quand même la base non ?<br /> Alors oui, une fois que j&rsquo;ai écris ma fonction ou variable une fois, il me la propose pour la suite de fichier… mais c&rsquo;est mieux ailleurs quoi.<br /> Refroidi je suis, mais continuons.
  </p>
  
  <h2>
    Fonctions
  </h2>
  
  <p>
    Gros point faible. Je ne m&rsquo;y retrouve pas du tout et pas mal de choses manquent cruellement.<br /> En fait c&rsquo;est surement en relation avec le point précédent. La prise en charge des langages n&rsquo;est pas optimale, on va dire.
  </p>
  
  <p>
    Des atouts sympas, il y en a quand même quelques uns.<br /> Déjà pas besoin d&rsquo;ouvrir de Projets a tout prix pour utiliser l&rsquo;IDE, comme avec IDEA par exemple. Ça facilite l&rsquo;ouverture rapide de fichiers pour des petites modifications<br /> Npm ET Yarn sont inclus, et d&rsquo;ailleurs j&rsquo;ai été surpris a la première ouverture l&rsquo;IDE à scanné l&rsquo;ordi pour voir ce qui y était installé, Docker, npm, yarn, python etc etc et a activé les plugins qui vont bien.<br /> Du coup on a une interface Git, bien sympa, avec l&rsquo;affichage coloré dans la marge du fichier des lignes modifiées et la possiblité de faire tout ce qu&rsquo;on fait en ligne de commande, ( status, pull, push, commit…) de façon graphique sans sortir de son IDE et ça c&rsquo;est cool.<br /> On a donc des menus contextuels pour npm et yarn avec la possibilité de mettre a jour, ajouter/supprimer des paquets depuis l&rsquo;IDE et surtout de lancer des scripts.
  </p>
  
  <p>
    <strong>Oups</strong>, je rectifie d&rsquo;avance ce que vous allez lire plus bas car j&rsquo;ai pas écrit dans l&rsquo;ordre et en vous disant ça j&rsquo;ai testé et découvert comment fonctionne ce qui ressemble à un Terminal. Continuez à lire.
  </p>
  
  <h3>
    Ce qui me manque le plus ?
  </h3>
  
  <p>
    Le refactor vraiment fonctionnel, oui celui ou t&rsquo;as juste à sélectionner le nom de ta variable/fonction et un Ctrl+R par exemple, pour changer le nom de toutes les occurences de ton fichier.
  </p>
  
  <p>
    Il y a aussi mon terminal dans l&rsquo;IDE.<br /> C&rsquo;est super utile pour moi, j&rsquo;utilise la majeure partie du temps des compileurs en temps réel, du coup chaque modification apportée au code est «Surveillée» par mon/mes compileurs et répercutées automatiquement au résultat (Page Web ou Simulateur de Smartphone). Je dis compileur, mais en vrai j&rsquo;englobe tout ce qui est Pug, Stylus, Node, Python (pour ce meme blog lancé en Jekyll par exemple).<br /> Sur Komodo, il y a la possibilité d&rsquo;avoir des consoles python, perl ou ruby <del>mais pas le simple terminal bash des familles. Dommage.</del><br /> <strong>Rectification</strong><br /> En fait si, c&rsquo;est le Command Output, sauf que c&rsquo;est bien compliqué d&rsquo;y taper ses commandes. Il faut échapper les commandes du coup <strong>« npm start » </strong>ne fonctionne pas, mais<strong>  » « npm » start « </strong><br /> fonctionne… plus ou moins, car impossible de l&rsquo;arrêter avec un Ctrl+C.
  </p>
  
  <p>
    Bref, toujours pas génial.<br /> Je l&rsquo;avoue je n&rsquo;ai pas été chercher plus loin, trop galérer sur des choses simples, a devoir retaper des noms de fonctions, déjà incluses 10fois dans le fichier sans qu&rsquo;aucune complétion ne me soit proposée. Je dis Stop, et revient à mon « Daily Driver ». Il fera l&rsquo;objet d&rsquo;un prochain article <em>(oui c&rsquo;est vrai que j&rsquo;aurais pu logiquement commencer par celui ci)</em>
  </p>
  
  <h2>
    Consommation
  </h2>
  
  <p>
    Non, mon ordi ne tourne pas au Sans plomb, bien heureusement même si techniquement oui, bref c&rsquo;est un autre débat.<br /> Je parle évidemment, de mémoire (RAM) parce que c&rsquo;est important, TRÈS important.<br /> J&rsquo;ai, avec IDEA, un gros soucis quand je laisse plusieurs projets ouverts, plusieurs jours. Ce qui est en vrai ma façon de fonctionner au quotidien.<br /> Au bout d&rsquo;un moment gros plantages et ralentissements de ma bécane.
  </p>
  
  <p>
    Avec Komodo pas de soucis, je ne l&rsquo;ai pas utilisé bien longtemps après tout, mais il est de manière générale beaucoup plus léger. Bon point pour Komodo cette fois.<br /> Seul bémol, les popups prennent bien 5secondes avant d&rsquo;afficher leur contenus. Quand tu tapes un Ctrl+W par inadvertence à cause du clavier non orthogonal <a href="https://jauneattitude.fr/ergojaunemie/" target="_blank">(découvrez de quoi je parle ici)</a> d&rsquo;origine de l&rsquo;ordi c&rsquo;est risqué.
  </p>
  
  <h2>
    Prix
  </h2>
  
  <p>
    Hmm, hmm, je fais un grand travail sur moi et j&rsquo;essaie de rentrer dans la légalité, c&rsquo;est dur.<br /> On va dire, que j&rsquo;ai testé la version d&rsquo;essai de Komodo, d&rsquo;accord ? <em>(clin d&rsquo;œil)</em><br /> Il est de base, payant. Prix d&rsquo;attaque à 295$ sans support ou mises a jour, 394$ avec…
  </p>
  
  <p>
    Il y a une version étudiante, a 147$… Pas pour le petit étudiant qui galère pour manger vous l&rsquo;aurez compris.
  </p>
  
  <p>
    Voila c&rsquo;est déjà pas mal, et ce sera tout pour ce sympathique IDE qui mérite encore un peu de boulot. C&rsquo;est déjà très bien et certains moins exigeants que moi y trouverons surement leur compte.
  </p>
  
  <p>
    Pour eux, voici le lien vers le site officiel :<a href="https://www.activestate.com/komodo-ide/whats-new"> https://www.activestate.com/komodo-ide/whats-new</a>
  </p>
  
  <p>
    Prochain test ? Je ne sais pas, peut-être SublimeText j&rsquo;en ai pas mal entendu parler, sans réellement essayer.
  </p>
  
  <p>
    Allez codez propre, et pensez à vous brosser les dents<br /> <em>(je dis ça mais je suis sur qu&rsquo;il y a un meilleur moyen que ce qu&rsquo;on veut nous faire croire pour entretenir nos dents. Chut! On verra ça plita)</em>
  </p>
</div>
