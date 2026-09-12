(() => {
  'use strict';

  const directions = {
    fusion: {
      name: 'Signal × Pocket',
      file: '04-signal-pocket.png',
      alt: 'Planche Signal × Pocket : device ambre, marques de peinture jaunes, interface mobile, affiche et widget.',
      thesis: 'Le device ambre de Maco Pocket, les marques de peinture et le jaune vif de Signal jaune.',
      palette: ['#FBBF24', '#000000', '#F5F5F4', '#2BB3A3'],
      type: 'Tanker pour les titres, Chakra Petch pour les chiffres. Space Grotesk pour lire et agir.',
      motion: 'Un point s’allume, le cadre s’ouvre, la vidéo apparaît.',
      stageVariant: 'signal',
      uses: [
        ['Mobile', 'Le projet et sa jauge en plein écran. Les marques de peinture restent dans les marges.'],
        ['Vidéo et posts', 'Des titres massifs et de grandes marques de peinture qui signent les épisodes.'],
        ['Widget', 'Un repère jaune et une jauge sobre pour garder l’objectif lisible sur chaque site.'],
        ['Device desktop', 'La coque ambrée en 3D de Maco Pocket comme interface dans le navigateur.']
      ]
    },
    signal: {
      name: 'Signal jaune',
      file: '01-signal-jaune.png',
      alt: 'Planche Signal jaune : identité noire et ambre, interface mobile, affiche, widget et alerte de déblocage.',
      thesis: 'Un signal jaune immédiatement reconnaissable, du titre de vidéo à l’alerte qui annonce un déblocage.',
      palette: ['#FBBF24', '#000000', '#F5F5F4', '#2BB3A3'],
      type: 'Tanker pour les titres. Space Grotesk pour lire et agir.',
      motion: 'Un point s’allume, le cadre s’ouvre, la vidéo apparaît.',
      uses: [
        ['Mobile', 'Un écran direct, de grands titres et l’action à portée du pouce.'],
        ['Vidéo et posts', 'Un titre massif, des repères de cadrage et un bandeau qui signe les épisodes.'],
        ['Widget', 'Un bloc compact qui garde visibles le projet et son objectif collectif.'],
        ['Device desktop', 'Le même signal sur un petit objet à l’écran, à explorer après le langage graphique.']
      ]
    },
    club: {
      name: 'Club Komisyon',
      file: '02-club-komisyon.png',
      alt: 'Planche Club Komisyon : papier crème, aplats jaunes, affiches, interface mobile et tampon de déblocage.',
      thesis: 'Des affiches, des tickets et un tampon de réussite pour donner au jeu l’allure d’un club créatif.',
      palette: ['#FBBF24', '#111111', '#F4EFE3', '#2BB3A3'],
      type: 'Tanker avec inclinaison artificielle pour cette exploration. Space Grotesk accompagne les textes.',
      motion: 'Le tampon descend, marque le passage, puis laisse place à la vidéo.',
      uses: [
        ['Mobile', 'Un tableau de participation clair, sur fond crème, avec des titres qui gardent leur énergie.'],
        ['Vidéo et posts', 'Des affiches typographiques, des découpes et un tampon à retrouver d’un épisode à l’autre.'],
        ['Widget', 'Un ticket détachable qui s’intègre au site de chaque projet.'],
        ['Device desktop', 'Une petite cartouche graphique à l’écran, dans la continuité des tickets et des affiches.']
      ]
    },
    pocket: {
      name: 'Maco Pocket',
      file: '03-maco-pocket.png',
      alt: 'Planche Maco Pocket : console de bureau ambrée, interface mobile sans coque, affiche et petits modules de jeu.',
      thesis: 'Une console personnelle à l’écran, avec une coque ambrée sur desktop et une interface légère sur mobile.',
      palette: ['#FBBF24', '#0C0A09', '#F5F5F4', '#2BB3A3'],
      type: 'Tanker pour les titres, Chakra Petch pour les chiffres. Space Grotesk garde les textes lisibles.',
      motion: 'Le voyant s’allume, un tiroir s’ouvre et révèle la vidéo.',
      uses: [
        ['Mobile', 'L’interface occupe tout l’écran. Un voyant et quelques détails rappellent la console.'],
        ['Vidéo et posts', 'De grands titres, des chiffres anguleux et les mêmes signes de déblocage.'],
        ['Widget', 'Un petit module autonome qui reprend le voyant et le compteur du jeu.'],
        ['Device desktop', 'Une coque ambrée en 3D comme interface à explorer dans le navigateur.']
      ]
    }
  };

  const byId = (id) => document.getElementById(id);
  const buttons = Array.from(document.querySelectorAll('[data-direction][aria-pressed]'));
  const panel = byId('direction-panel');
  const boardImage = byId('board-image');
  const stage = byId('motion-stage');
  const replayButton = byId('replay-alert');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let replayTimer;

  function stopReplay() {
    window.clearTimeout(replayTimer);
    stage.classList.remove('is-playing');
    replayButton.disabled = false;
  }

  function chooseDirection(key, announce = true) {
    const direction = directions[key];
    if (!direction) return;
    stopReplay();
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.direction === key)));
    panel.dataset.direction = key;
    byId('direction-title').textContent = direction.name;
    byId('direction-thesis').textContent = direction.thesis;
    byId('board-link').href = direction.file;
    byId('board-link').setAttribute('aria-label', `Ouvrir la planche ${direction.name} en plein format`);
    byId('download-link').href = direction.file;
    byId('download-link').download = direction.file;
    byId('download-link').setAttribute('aria-label', `Télécharger la planche ${direction.name} au format PNG`);
    byId('image-error').hidden = true;
    boardImage.alt = direction.alt;
    boardImage.src = direction.file;
    byId('type-caption').textContent = direction.type;
    byId('type-counter').hidden = key !== 'pocket' && key !== 'fusion';
    byId('motion-description').textContent = direction.motion;
    stage.dataset.variant = direction.stageVariant || key;

    const palette = byId('palette');
    palette.setAttribute('aria-label', `Palette de ${direction.name}`);
    palette.replaceChildren(...direction.palette.map((hex) => {
      const chip = document.createElement('li');
      const swatch = document.createElement('span');
      swatch.className = 'swatch';
      swatch.style.setProperty('--swatch', hex);
      swatch.setAttribute('aria-hidden', 'true');
      const label = document.createElement('span');
      label.textContent = hex;
      chip.append(swatch, label);
      return chip;
    }));

    byId('applications-list').replaceChildren(...direction.uses.map(([label, text]) => {
      const item = document.createElement('div');
      const term = document.createElement('dt');
      const description = document.createElement('dd');
      term.textContent = label;
      description.textContent = text;
      item.append(term, description);
      return item;
    }));

    if (announce) {
      byId('selection-status').textContent = `${direction.name}, planche et spécimens affichés.`;
      try { window.history.replaceState(null, '', `#${key}`); } catch { /* Local file navigation remains usable. */ }
    }
  }

  buttons.forEach((button) => button.addEventListener('click', () => chooseDirection(button.dataset.direction)));
  boardImage.addEventListener('load', () => { byId('image-error').hidden = true; });
  boardImage.addEventListener('error', () => { byId('image-error').hidden = false; });

  replayButton.addEventListener('click', () => {
    stopReplay();
    if (motionPreference.matches) {
      byId('selection-status').textContent = 'Aperçu du déblocage affiché sans mouvement.';
      return;
    }
    stage.classList.add('is-playing');
    replayButton.disabled = true;
    replayTimer = window.setTimeout(stopReplay, 1150);
  });

  motionPreference.addEventListener('change', stopReplay);
  window.addEventListener('hashchange', () => chooseDirection(window.location.hash.slice(1), false));
  const initialDirection = window.location.hash.slice(1);
  const hasInitialDirection = Object.hasOwn(directions, initialDirection);
  chooseDirection(hasInitialDirection ? initialDirection : 'fusion', false);
  if (!hasInitialDirection) {
    try { window.history.replaceState(null, '', '#fusion'); } catch { /* Local file navigation remains usable. */ }
  }
})();
