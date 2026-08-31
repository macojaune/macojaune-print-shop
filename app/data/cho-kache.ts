export type ChoKacheLocation =
  | {
      visibility: 'public'
      label: string
      detail: string
      latitude?: number
      longitude?: number
    }
  | {
      visibility: 'secret'
    }

export type ChoKachePrint = {
  publicNumber: number
  status: 'draft' | 'active' | 'found'
  location: ChoKacheLocation
  clue: string
}

// Public display data only. Exact secret coordinates must stay server-side and
// must never be added to this file or serialized into the public page payload.
export const choKachePrints: ChoKachePrint[] = [
  {
    publicNumber: 1,
    status: 'active',
    location: {
      visibility: 'public',
      label: 'Bientôt sur la carte',
      detail: "Je dois encore ajouter le point exact.",
    },
    clue: 'Encore un peu de patience.',
  },
  {
    publicNumber: 2,
    status: 'active',
    location: {
      visibility: 'secret',
    },
    clue: 'Il arrivera sur mes réseaux. Faudra veiller au grain.',
  },
  {
    publicNumber: 3,
    status: 'active',
    location: {
      visibility: 'secret',
    },
    clue: 'Même principe pour celle-ci. Il faudra suivre les indices.',
  },
]
