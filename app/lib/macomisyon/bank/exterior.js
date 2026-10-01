import * as THREE from 'three'

// Resources are owned by Jarry's shared mesh/material helpers and disposed with it.
export const BANK_POSITION = { x: -26, z: -7 }
export function createBankExterior({ scene, box, mesh, palette }) {
  const root = new THREE.Group()
  root.position.set(BANK_POSITION.x, 0, BANK_POSITION.z)
  scene.add(root)
  const stone = 0xe6dec2
  const brass = 0xd2a345
  const ink = palette.ink
  const block = (size, pos, color) => box(size, pos, color, root)
  const cylinder = (radius, height, pos, color) => mesh(new THREE.CylinderGeometry(radius, radius, height, 12), color, pos, root)
  block([7.1, .18, 6.8], [0, .1, .8], palette.pavement)
  for (let i = 0; i < 3; i++) block([6.8 - i * .28, .18, 1.25 - i * .25], [0, .26 + i * .18, 3.2 - i * .13], stone)
  block([6.1, 2.9, 3.6], [0, 1.8, -.45], stone)
  block([6.5, .24, 4.3], [0, 3.35, -.15], brass)
  block([6.65, .18, 4.5], [0, 3.54, -.15], palette.paper)
  block([5.7, .2, 3.3], [0, 3.76, -.45], stone)
  // Deep portico and columns read as a bank, even in the overview.
  for (const x of [-2.45, -1.1, 1.1, 2.45]) {
    block([.63, .18, .63], [x, .69, 1.83], brass)
    cylinder(.22, 2.22, [x, 1.89, 1.83], palette.paper)
    cylinder(.3, .2, [x, 3.05, 1.83], stone)
    block([.64, .17, .62], [x, 3.19, 1.83], palette.paper)
  }
  block([6.5, .35, .8], [0, 3.49, 1.77], stone)
  const triangle = new THREE.Shape()
  triangle.moveTo(-3.3, 0); triangle.lineTo(0, 1.2); triangle.lineTo(3.3, 0); triangle.closePath()
  const pediment = mesh(new THREE.ExtrudeGeometry(triangle, { depth: .48, bevelEnabled: false }), palette.paper, [0, 3.65, 1.6], root)
  pediment.castShadow = true
  const emblem = cylinder(.39, .1, [0, 4.13, 2.15], brass)
  emblem.rotation.x = Math.PI / 2
  // Two reel holes hint at a cassette, without spelling out the project.
  for (const x of [-.14, .14]) {
    const reel = cylinder(.085, .035, [x, 4.14, 2.22], ink)
    reel.rotation.x = Math.PI / 2
  }
  block([1.3, 2.35, .09], [0, 1.74, 1.41], ink)
  const shutter = block([1.24, 2.3, .12], [0, 1.76, 1.48], 0x708782)
  const doorLight = block([1.35, .12, .18], [0, 3, 1.5], palette.yellow)
  for (const x of [-2, 2]) {
    block([1.22, 1.53, .13], [x, 1.96, 1.39], brass)
    block([1.05, 1.32, .15], [x, 1.96, 1.46], 0x416e70)
    block([.055, 1.33, .05], [x, 1.96, 1.55], palette.paper)
    block([1.05, .055, .05], [x, 1.96, 1.55], palette.paper)
  }
  const letters = []
  for (let i = 0; i < 8; i++) letters.push(block([.37, .1, .24], [-2.35 + i % 3 * .26, 1.42 + Math.floor(i / 3) * .14, 1.65], i % 2 ? palette.paper : palette.yellow))
  // A very small ATM and queue posts preserve the serious silhouette.
  block([.66, 1.35, .45], [3.18, 1.15, 1.65], ink)
  block([.44, .35, .05], [3.18, 1.43, 1.9], 0x79b8af)
  block([.39, .045, .08], [3.18, .99, 1.91], brass)
  const carpet = block([1.05, .026, 2.1], [0, .59, 3], palette.yellow)
  const flag = block([.95, .65, .045], [2.8, 4.9, -.7], palette.yellow)
  cylinder(.035, 1.5, [2.32, 4.48, -.7], brass)
  const progressLamps = [-.35, 0, .35].map(x => block([.17, .14, .08], [x, 3.49, 2.2], palette.yellow))
  let unlocked = false
  let betaOpen = false
  let aperture = 0
  let hasState = false
  function pose() {
    shutter.scale.y = 2.3 * (1 - aperture * .96)
    shutter.position.y = 2.91 - shutter.scale.y / 2
  }
  function settle() { aperture = unlocked ? 1 : 0; pose() }
  function setState(state, { animate = false } = {}) {
    unlocked = !!state?.completed?.includes('curiosity')
    betaOpen = !!state?.betaOpen
    const count = Math.min(8, Math.max(0, state?.counts?.newsletter || 0))
    letters.forEach((letter, index) => { letter.visible = unlocked && index < count })
    carpet.visible = betaOpen
    flag.visible = betaOpen
    doorLight.visible = unlocked
    const complete = ['curiosity', 'newsletter', 'applications']
    progressLamps.forEach((lamp, index) => { lamp.visible = !!state?.completed?.includes(complete[index]) })
    // Shared material cache: swap materials, never mutate another building's colors.
    if (!animate || !hasState) settle()
    hasState = !!state
  }
  setState(null)
  return {
    setState, settle,
    update(dt) { aperture = THREE.MathUtils.damp(aperture, unlocked ? 1 : 0, 4, dt); pose() },
    getDebug() { return { unlocked, betaOpen, aperture } },
  }
}
