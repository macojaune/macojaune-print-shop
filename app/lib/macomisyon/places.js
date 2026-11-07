// Outside, visitors recognise places by their shape and clues. Project names
// belong to the interior reveal, except the explicitly named external studio.
/**
 * @typedef {Object} Place
 * @property {string} id
 * @property {string} icon
 * @property {string} name
 * @property {string} description
 * @property {boolean} [available]
 * @property {string} [interior]
 * @property {string} [enterLabel]
 * @property {'discovery'|'external'} [kind]
 * @property {'selected'} [markerMode]
 * @property {string} [externalUrl]
 * @property {string} [externalLabel]
 * @property {{ name: string, revealLabel: string, steps: Array<{ id: string, gameId: number, label: string, description: string, availability: string, status: 'prepared', completionCriteria: null }> }} [project]
 */

/** @type {Place[]} */
export const places = [
  { id: 'memebank', interior: 'bank', enterLabel: 'Entrer dans la banque', icon: 'bank', name: 'La banque', description: 'Des colonnes, un rideau fermé. Derrière cette façade très sérieuse, on protège quelque chose… mais quoi ?', available: false },
  { id: 'quilivreou', interior: 'depot-q', enterLabel: 'Entrer au dépôt', icon: 'parcel', name: 'Le hangar', description: 'Des colis attendent derrière la porte. Un gyrophare tourne encore. Tu peux entrer.', available: true },
  { id: 'shootareas', icon: 'camera', name: 'La maison sur l’eau', description: 'Une terrasse face à la mer. Derrière les vitres, on devine un studio. La porte est encore fermée.', available: false },
  { id: 'zikak', icon: 'lock', name: 'L’atelier fermé', description: 'De la lumière filtre sous le rideau. Quelque chose se prépare ici, mais il faudra revenir.', available: false },
  { id: 'kokolo', kind: 'discovery', markerMode: 'selected', icon: 'car', name: 'La voiture à l’écart', description: 'Une voiture garée à l’écart.' },
  { id: 'maggma-studio', kind: 'external', icon: 'volcano', name: 'MAGGMA Studio', description: 'Retrouve le studio sur son site.', externalUrl: 'https://maggma.studio/', externalLabel: 'Visiter le site du studio' },
  { id: 'omasla', kind: 'discovery', icon: 'drum', name: 'La cour du mas', description: 'Des tambours rangés, des costumes et des fanions. Les préparatifs se poursuivent dans la cour.', available: false },
  {
    id: 'scolo', kind: 'discovery', icon: 'arcade', name: 'L’abri aux trois bornes',
    description: 'Sous un auvent jaune, trois bornes attendent. Une sandale est posée sur le toit.',
    project: {
      name: 'Scolo · BÈT a milpat', revealLabel: 'Regarder sous l’auvent',
      // Prepared editorial steps only. No objective, counter, reward or completion action.
      // gameId belongs to Scolo; its scores and gains remain entirely in that product.
      steps: [
        { id: 'scolo-mini-jeu-1', gameId: 1, label: 'mini-jeu 1', description: 'Sandale · Survie', availability: 'Disponible sur Scolo', status: 'prepared', completionCriteria: null },
        { id: 'scolo-mini-jeu-2', gameId: 2, label: 'mini-jeu 2', description: 'Digrain · Tir par vagues, réserve de pression', availability: 'En test sur DEV uniquement', status: 'prepared', completionCriteria: null },
        { id: 'scolo-mini-jeu-3', gameId: 3, label: 'mini-jeu 3', description: 'Coutelas · Lancer avec angle et puissance', availability: 'En test sur DEV uniquement', status: 'prepared', completionCriteria: null },
      ],
    },
  },
]
