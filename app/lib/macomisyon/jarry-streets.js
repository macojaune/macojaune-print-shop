import * as THREE from 'three'
import { geography } from './jarry-geography.js'
import { groundHeight } from './jarry-elevation.js'

// Labels belong to mapped road segments. No street name or position is invented.
const streets = geography.roads.filter(road => road.name && road.points.length > 1).map(road => {
  const lengths = road.points.slice(1).map((point, i) => Math.hypot(point[0] - road.points[i][0], point[1] - road.points[i][1]))
  const length = lengths.reduce((sum, value) => sum + value, 0)
  let distance = length / 2, segment = 0
  while (segment < lengths.length - 1 && distance > lengths[segment]) distance -= lengths[segment++]
  const a = road.points[segment], b = road.points[segment + 1]
  const t = lengths[segment] ? distance / lengths[segment] : 0
  const x = THREE.MathUtils.lerp(a[0], b[0], t), z = THREE.MathUtils.lerp(a[1], b[1], t)
  const direction = new THREE.Vector3(b[0] - a[0], 0, b[1] - a[1]).normalize()
  return { id: road.id, name: road.name, length, position: new THREE.Vector3(x, groundHeight(x, z) + 0.045, z), direction }
}).sort((a, b) => b.length - a.length)

export function projectStreetLabels(camera, width, height, landmarks) {
  if (camera.zoom < 2.5) return []
  const labels = [], names = new Set()
  const screen = point => {
    const projected = point.clone().project(camera)
    return { x: (projected.x + 1) * width / 2, y: (1 - projected.y) * height / 2, depth: projected.z }
  }
  for (const street of streets) {
    if (names.has(street.name)) continue
    const center = screen(street.position)
    if (center.depth > 1 || center.x < 100 || center.x > width - 85 || center.y < 125 || center.y > height - 80) continue
    const end = screen(street.position.clone().add(street.direction.clone().multiplyScalar(street.length / 2)))
    const textWidth = Math.min(175, street.name.length * 6.5)
    if (Math.hypot(end.x - center.x, end.y - center.y) * 2 < textWidth + 24) continue
    if (landmarks.some(marker => marker.visible && Math.abs(marker.x - center.x) < textWidth / 2 + 45 && Math.abs(marker.y - 22 - center.y) < 65)) continue
    if (labels.some(label => Math.abs(label.x - center.x) < (label.width + textWidth) / 2 + 35 && Math.abs(label.y - center.y) < 60)) continue
    let angle = Math.atan2(end.y - center.y, end.x - center.x) * 180 / Math.PI
    if (angle > 90) angle -= 180
    if (angle < -90) angle += 180
    labels.push({ id: street.id, name: street.name, x: center.x, y: center.y, angle, width: textWidth })
    names.add(street.name)
    if (labels.length >= (width < 600 ? 3 : 10)) break
  }
  return labels
}
