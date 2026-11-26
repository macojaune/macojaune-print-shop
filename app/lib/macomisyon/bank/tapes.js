import { PlaneGeometry } from 'three'

const HALF_THICKNESS = .07
const SPILL_START = .46, SPILL_STAGGER = .03, SPILL_DURATION = .35
const clamp01 = value => Math.min(1, Math.max(0, value))
const smooth = value => value * value * (3 - 2 * value)

// Vault-local coordinates. Three tapes rest between the runner's raised borders
// (top .1075); four sit entirely beyond its edges on the tiles (top .06).
// Flat VHS have +Z faces, so XYZ [-PI/2, 0, yaw] keeps the label facing +Y.
const SPILL = [
  { scale: 1.28, from: [1.45, 1.12, -1.91], to: [1.45, .67], floor: .1075, yaw: .32, tilt: -.28, roll: -.18, impact: .74, bounce: .070 },
  { scale: .82, from: [1.06, 1.00, -1.95], to: [.02, -.22], floor: .06, yaw: -.65, tilt: -.72, roll: .26, impact: .72, bounce: .052 },
  { scale: .84, from: [1.82, .96, -1.98], to: [2.84, -.30], floor: .06, yaw: 1.12, tilt: -.12, roll: -.31, impact: .76, bounce: .060 },
  { scale: .90, from: [1.53, .88, -1.84], to: [1.46, -.43], floor: .1075, yaw: -.10, tilt: -.95, roll: .17, impact: .73, bounce: .043 },
  { scale: .78, from: [1.13, 1.18, -1.88], to: [.21, .80], floor: .06, yaw: 1.60, tilt: -.48, roll: -.25, impact: .75, bounce: .064 },
  { scale: .80, from: [1.74, 1.06, -1.96], to: [2.81, .88], floor: .06, yaw: 1.30, tilt: -.20, roll: .34, impact: .72, bounce: .055 },
  { scale: .86, from: [1.42, 1.12, -1.89], to: [1.45, 1.54], floor: .1075, yaw: -.12, tilt: -.84, roll: .23, impact: .74, bounce: .047 },
]

// The bank's treasure is deliberately all VHS: no cash, lounge or video screens.
// Helpers belong to the world; its registry owns every GPU resource built here.
export function createVhsArchives({ root, group, box, mesh, geometry, painted, palette: p }) {
  const plastic = 0x1a1e1b, seam = 0x0c100e
  const model = {
    format: 'VHS', dimensions: [1, .55, .14], face: '+Z',
    label: 'MÈMES', marking: 'VHS', windowCount: 2,
    reelColor: 'brown-black', hubColor: 'cream', hubToReelRatio: 30 / 104,
    hubTeeth: 12, windowFinish: 'smoked',
  }
  // One opaque, shared face map: smoked windows need no transparent draw pass.
  // The world's painted() repaints this same canvas when existing fonts are ready.
  const faceMaterial = painted((ctx, w, h) => {
    ctx.fillStyle = '#1a1e1b'
    ctx.fillRect(0, 0, w, h)
    // Moulded tape-protection flap and finger grips, not a coloured audio shell.
    ctx.fillStyle = '#101410'
    ctx.fillRect(14, 8, w - 28, 42)
    ctx.fillStyle = '#41483f'
    ctx.fillRect(24, 50, w - 48, 3)
    for (const x of [20, w - 53]) {
      for (let y = 91; y < 322; y += 16) {
        ctx.fillStyle = '#30362f'
        ctx.fillRect(x, y, 33, 4)
        ctx.fillStyle = '#10140f'
        ctx.fillRect(x, y + 4, 33, 3)
      }
    }
    for (const x of [106, 614]) {
      const cx = x + 152, cy = 204
      // Two separate rectangular recesses, with a wide black bridge between them.
      ctx.fillStyle = '#080d0a'
      ctx.fillRect(x - 7, 72, 318, 261)
      ctx.fillStyle = '#485046'
      ctx.fillRect(x - 3, 76, 310, 3)
      ctx.save()
      ctx.beginPath()
      ctx.rect(x, 82, 304, 244)
      ctx.clip()
      ctx.fillStyle = '#30382f'
      ctx.fillRect(x, 82, 304, 244)
      ctx.beginPath()
      ctx.arc(cx, cy, 104, 0, Math.PI * 2)
      ctx.fillStyle = '#30251d'
      ctx.fill()
      // Wound magnetic tape stays brown-black; only the small drive hub is ivory.
      for (const radius of [99, 89, 78, 66, 52]) {
        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.strokeStyle = radius % 2 ? '#44362a' : '#211c16'
        ctx.lineWidth = 3
        ctx.stroke()
      }
      ctx.beginPath()
      for (let tooth = 0; tooth < 48; tooth++) {
        const angle = tooth * Math.PI / 24
        const radius = tooth % 4 < 2 ? 30 : 25
        const px = cx + Math.cos(angle) * radius, py = cy + Math.sin(angle) * radius
        if (tooth === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.fillStyle = '#d8ceb1'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(cx, cy, 12, 0, Math.PI * 2)
      ctx.fillStyle = '#171b15'
      ctx.fill()
      // Smoke and a restrained edge reflection are baked into the opaque map.
      ctx.fillStyle = 'rgba(25, 37, 29, .14)'
      ctx.fillRect(x, 82, 304, 244)
      ctx.fillStyle = 'rgba(181, 194, 171, .12)'
      ctx.beginPath()
      ctx.moveTo(x, 82); ctx.lineTo(x + 304, 82)
      ctx.lineTo(x + 278, 102); ctx.lineTo(x, 102)
      ctx.closePath(); ctx.fill()
      ctx.restore()
    }
    // A generous paper strip gives the word priority over decorative microcopy.
    ctx.fillStyle = '#0c110d'
    ctx.fillRect(80, 357, 864, 159)
    ctx.fillStyle = '#f4ead3'
    ctx.fillRect(84, 361, 856, 151)
    ctx.fillStyle = '#1a231d'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.font = '700 142px "Space Grotesk", sans-serif'
    ctx.fillText('MÈMES', 106, 442, 625)
    ctx.fillStyle = '#d5cbb2'
    ctx.fillRect(748, 377, 3, 118)
    ctx.strokeStyle = '#273027'
    ctx.lineWidth = 4
    ctx.strokeRect(776, 400, 136, 78)
    ctx.textAlign = 'center'
    ctx.font = '62px Tanker, "Space Grotesk", sans-serif'
    ctx.fillStyle = '#273027'
    ctx.fillText('VHS', 844, 442, 112)
    // Four small recessed screw heads remain moulding, never bright white reels.
    for (const x of [36, 988]) for (const y of [29, 513]) {
      ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2)
      ctx.fillStyle = '#080c09'; ctx.fill()
      ctx.fillStyle = '#42483d'; ctx.fillRect(x - 4, y - 1, 8, 2)
    }
  }, 1024, 544)
  const faceGeometry = geometry('vhs:front-plane:1x1', () => new PlaneGeometry(1, 1))
  let archivedCount = 0, normalizedOpen = 0

  function cassette(parent, position, scale = 1, flat = false) {
    const tape = group(parent, position)
    tape.name = 'vhs-cassette'
    tape.userData.vhs = { ...model, dimensions: [...model.dimensions] }
    tape.scale.setScalar(scale)
    if (flat) tape.rotation.x = -Math.PI / 2
    // Two bevelled halves and a recessed joint give the full 187:103:25 silhouette.
    box(tape, [.98, .53, .016], [0, 0, 0], seam).name = 'vhs-shell-seam'
    for (const z of [-.037, .037]) {
      box(tape, [1, .55, .066], [0, 0, z], plastic, .012).name = 'vhs-shell-half'
    }
    box(tape, [.918, .036, .138], [0, .257, 0], seam, .004).name = 'vhs-top-flap'
    for (const x of [-.499, .499]) for (const y of [-.14, -.09, -.04, .01]) {
      box(tape, [.005, .009, .112], [x, y, 0], seam).name = 'vhs-side-grip'
    }
    const face = mesh(tape, faceGeometry, faceMaterial, [0, 0, .0704])
    face.name = 'vhs-printed-face'
    face.scale.set(.968, .514, 1)
    face.castShadow = false
    face.userData.vhs = { ...model, surface: 'procedural-opaque-face' }
    return tape
  }
  const archives = group(root)
  archives.name = 'vhs-archives'
  box(archives, [2.62, .09, 1.36], [1.45, .5, -2.77], p.ink, .02)
  // Curved doorway dictates the shelf widths: narrowed top/bottom, wider middle.
  for (let row = 0; row < 4; row++) {
    const y = .76 + row * .69
    const width = row === 0 || row === 3 ? 2.1 : 2.64
    box(archives, [width, .07, .7], [1.45, y, -2.69], p.brass, .012)
    const count = row === 0 || row === 3 ? 3 : 4
    for (let col = 0; col < count; col++) {
      const x = 1.45 + (col - (count - 1) / 2) * .62
      const roll = (col % 3 - 1) * .025
      const halfHeight = .58 * (.275 * Math.cos(roll) + .5 * Math.abs(Math.sin(roll)))
      const tape = cassette(archives, [x, y + .035 + halfHeight, -2.45], .58)
      tape.rotation.z = roll
      cassette(archives, [x, y + .035 + .275 * .56, -2.93], .56)
      archivedCount += 2
    }
  }
  for (const x of [.35, 2.55]) box(archives, [.055, 2.2, .06], [x, 1.88, -2.98], p.ink)
  // These short piles share the existing lower shelf, not unsupported pedestals.
  for (const [x, scale, count, yaw] of [[.87, .65, 4, -.10], [2.03, .58, 3, .08]]) {
    for (let i = 0; i < count; i++) {
      const tape = cassette(archives, [x, .545 + HALF_THICKNESS * scale + i * .1404 * scale, -2.13], scale, true)
      tape.rotation.z = yaw + i * .035
      archivedCount++
    }
  }
  const spillTapes = SPILL.map((spec, i) => {
    const tape = cassette(root, spec.from, spec.scale)
    tape.userData.spillIndex = i
    return tape
  })

  function update(open) {
    // Ignore non-finite/non-number input rather than letting NaN poison matrices.
    normalizedOpen = Number.isFinite(open) ? clamp01(open) : 0
    archives.visible = normalizedOpen > .025
    for (let i = 0; i < spillTapes.length; i++) {
      const tape = spillTapes[i], spec = SPILL[i]
      const t = clamp01((normalizedOpen - (SPILL_START + i * SPILL_STAGGER)) / SPILL_DURATION)
      const finalY = spec.floor + HALF_THICKNESS * spec.scale
      tape.visible = t > 0
      if (t === 0) {
        tape.position.set(...spec.from)
        tape.rotation.set(spec.tilt, 0, spec.roll)
      } else if (t === 1) {
        tape.position.set(spec.to[0], finalY, spec.to[1])
        tape.rotation.set(-Math.PI / 2, 0, spec.yaw)
      } else {
        const fall = Math.min(1, t / spec.impact)
        const slide = clamp01((t - spec.impact) / (1 - spec.impact))
        const travel = t < spec.impact ? .945 * fall : .945 + .055 * (1 - (1 - slide) ** 2)
        const bouncePhase = clamp01((t - spec.impact) / .18)
        const bounce = 4 * bouncePhase * (1 - bouncePhase)
        const rock = (i % 2 ? -1 : 1) * .065 * bounce
        tape.rotation.set(
          spec.tilt + (-Math.PI / 2 - spec.tilt) * smooth(fall) + rock,
          0,
          spec.roll + (spec.yaw - spec.roll) * smooth(fall),
        )
        // Ballistic descent, one small impact rebound, then dry friction. The
        // extra half-height under the rocking body prevents its edge sinking.
        const q = tape.quaternion
        const halfHeight = spec.scale * (
          .5 * Math.abs(2 * (q.x * q.y + q.z * q.w))
          + .275 * Math.abs(1 - 2 * (q.x * q.x + q.z * q.z))
          + HALF_THICKNESS * Math.abs(2 * (q.y * q.z - q.x * q.w))
        )
        const y = t < spec.impact
          ? spec.from[1] + (finalY - spec.from[1]) * fall * fall
          : spec.floor + halfHeight + spec.bounce * bounce
        tape.position.set(
          spec.from[0] + (spec.to[0] - spec.from[0]) * travel,
          y,
          spec.from[2] + (spec.to[1] - spec.from[2]) * travel,
        )
      }
    }
  }
  update(0)
  return {
    archives,
    heroTape: spillTapes[0],
    spillTapes,
    update,
    getDebug() {
      return {
        open: normalizedOpen,
        archivedCount,
        spillCount: spillTapes.length,
        visibleSpillCount: spillTapes.filter(tape => tape.visible).length,
        model: { ...model, dimensions: [...model.dimensions] },
        poses: spillTapes.map((tape, i) => ({
          position: tape.position.toArray(),
          rotation: [tape.rotation.x, tape.rotation.y, tape.rotation.z],
          visible: tape.visible,
          scale: tape.scale.x,
          start: SPILL_START + i * SPILL_STAGGER,
          duration: SPILL_DURATION,
          supportY: SPILL[i].floor,
        })),
      }
    },
  }
}
