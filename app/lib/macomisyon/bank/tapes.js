import { PlaneGeometry } from 'three'

// The bank's treasure is deliberately all VHS: no cash, lounge or video screens.
// Helpers belong to the world; its registry owns every GPU resource built here.
export function createVhsArchives({ root, group, box, mesh, disc, geometry, painted, palette: p }) {
  const titles = ['RÉACTION N°42', 'À REMBOBINER', 'MASTER DU CHAOS']
  const labels = titles.map((title, i) => painted((ctx, w, h) => {
    ctx.fillStyle = i === 1 ? '#ffcd43' : '#f4ead3'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#253e3b'
    ctx.font = '700 37px sans-serif'
    ctx.textBaseline = 'middle'
    ctx.fillText(title, 18, h * .52, w - 36)
    for (let mark = 0; mark < 8; mark++) ctx.fillRect(w - 85 + mark * 8, h - 18, 3, 12)
  }, 384, 112))
  function cassette(parent, position, scale = 1, index = 0, flat = false) {
    const tape = group(parent, position)
    tape.name = 'vhs-cassette'
    tape.scale.setScalar(scale)
    if (flat) tape.rotation.x = -Math.PI / 2
    box(tape, [.91, .56, .18], [0, 0, 0], p.deepInk, .022)
    box(tape, [.76, .26, .025], [0, .085, .096], 0x52635d, .012)
    for (const x of [-.235, .235]) {
      disc(tape, .106, .018, [x, .085, .117], p.paper, 16)
      disc(tape, .036, .022, [x, .085, .129], p.deepInk, 8)
      box(tape, [.026, .12, .012], [x, .085, .141], p.steelLight)
    }
    box(tape, [.72, .032, .025], [0, .245, .092], 0x6b7970)
    const label = mesh(tape, geometry('plane', () => new PlaneGeometry(1, 1)), labels[index % labels.length], [0, -.161, .096])
    label.scale.set(.7, .13, 1)
    for (const x of [-.36, .36]) disc(tape, .014, .012, [x, -.234, .099], p.steelLight, 6)
    return tape
  }
  const archives = group(root)
  box(archives, [2.62, .09, 1.36], [1.45, .5, -2.77], p.ink, .02)
  // Curved doorway dictates the shelf widths: narrowed top/bottom, wider middle.
  for (let row = 0; row < 4; row++) {
    const y = .76 + row * .69
    const width = row === 0 || row === 3 ? 2.1 : 2.64
    box(archives, [width, .07, .7], [1.45, y, -2.69], p.brass, .012)
    const count = row === 0 || row === 3 ? 3 : 4
    for (let col = 0; col < count; col++) {
      const tape = cassette(archives, [1.45 + (col - (count - 1) / 2) * .56, y + .235, -2.45], .58, row + col)
      tape.rotation.z = (col % 3 - 1) * .04
      cassette(archives, [1.45 + (col - (count - 1) / 2) * .56, y + .225, -2.93], .56, row + col + 1)
    }
  }
  for (const x of [.35, 2.55]) box(archives, [.055, 2.2, .06], [x, 1.88, -2.98], p.ink)
  // A few slightly precarious piles bring the archive forward into the threshold.
  for (let i = 0; i < 4; i++) {
    const tape = cassette(archives, [.67, .68 + i * .115, -1.98], .65, i, true)
    tape.rotation.y = -.15 + i * .12
  }
  for (let i = 0; i < 3; i++) {
    const tape = cassette(archives, [2.24, .62 + i * .105, -1.92], .58, i + 1, true)
    tape.rotation.y = .18 - i * .09
  }
  const heroTape = cassette(root, [1.45, .24, -1.85], 1.28, 2, true)
  heroTape.visible = false
  return {
    archives,
    heroTape,
    update(open) {
      archives.visible = open > .025
      const t = Math.min(1, Math.max(0, (open - .66) / .34))
      const ease = t * t * (3 - 2 * t)
      heroTape.visible = t > 0
      heroTape.position.set(1.45, .24 + Math.sin(ease * Math.PI) * .14, -1.85 + ease * 2.65)
      heroTape.rotation.y = -.16 * ease
    },
  }
}
