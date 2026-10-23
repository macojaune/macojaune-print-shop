// Additional authored landmarks use exact replacement IDs rather than the
// original 120 m site clearance. Coordinates use Jarry's local 20 m scene grid.
export const LANDMARK_SITES = {
  kokolo: { x: 63.5, z: 77, angle: -.45, replaceBuildings: [] },
  // The small U above the original A/B candidates, identified by Marvin.
  'maggma-studio': { x: 45.328375, z: 17.117870, angle: -.0862610221, model: { width: .4, depth: .64, height: .45 }, replaceBuildings: ['way/131121970/0'] },
  // A fictional local and courtyard in the area of VIM indicated by Marvin.
  // This does not identify the real group's exact premises.
  omasla: { x: 92.2, z: -64.6, angle: 1.147, model: { width: 1, depth: .8, height: .35 }, replaceBuildings: [] },
}

export const REPLACED_BUILDING_IDS = new Set(Object.values(LANDMARK_SITES).flatMap(site => site.replaceBuildings))
