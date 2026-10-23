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
]
