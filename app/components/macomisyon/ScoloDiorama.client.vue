<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  completed: { type: Array, default: () => [] },
  paused: { type: Boolean, default: false },
  selected: { type: String, default: null },
})
const emit = defineEmits(['select', 'ready', 'error'])
const canvas = ref(null)
const markers = ref([])
const available = ref(false)
const names = { sandale: 'Sandale', coutelas: 'Coutelas', digrain: 'Digrain' }
const houseDescription = computed(() => props.completed.length === 3
  ? 'Maison créole en coupe. Tout est emballé, un panneau À louer est planté dans la cour et le camion attend. Les scolos assiègent la maison.'
  : 'Maison créole en coupe envahie de scolos : le salon, la cuisine et la galerie. ' + props.completed.length + ' arme sur 3 utilisée.')
let world
let panelObserver
let panel
let alive = true

function availability(value) {
  available.value = value
  emit(value ? 'ready' : 'error')
}

function frameStation() {
  if (!world) return
  const next = props.selected && canvas.value?.closest('.scolo-house')?.querySelector('.depot-panel')
  if (next !== panel) {
    if (panel) panelObserver.unobserve(panel)
    panel = next
    if (panel) panelObserver.observe(panel)
  }
  world.focusStation(props.selected, panel?.getBoundingClientRect())
}
watch(() => [props.completed, props.selected], () => {
  world?.setState(props.completed, props.selected)
  frameStation()
}, { deep: true, flush: 'post' })
watch(() => props.paused, value => world?.setPaused(value))

onMounted(async () => {
  try {
    const { createScoloWorld } = await import('../../lib/macomisyon/scolo/world.js')
    if (!alive) return
    world = createScoloWorld(canvas.value, {
      onMarkers: value => { markers.value = value },
      onSelect: id => emit('select', id),
      onAvailability: availability,
    })
    panelObserver = new ResizeObserver(frameStation)
    panelObserver.observe(canvas.value)
    world.setState(props.completed, props.selected)
    world.setPaused(props.paused)
    frameStation()
    availability(true)
  } catch {
    if (alive) availability(false)
  }
})
onBeforeUnmount(() => { alive = false; panelObserver?.disconnect(); world?.dispose() })
defineExpose({
  zoomBy: factor => world?.zoomBy(factor),
  resetView: () => world?.resetView(),
  getDebug: () => world?.getDebug(),
})
</script>

<template>
  <div class="scolo-diorama">
    <canvas ref="canvas" aria-label="Maison envahie de scolos, en 3D" role="img" :aria-description="houseDescription" />
    <template v-if="available">
      <button
        v-for="marker in markers" v-show="marker.visible && (!selected || selected === marker.id)" :key="marker.id" type="button"
        class="scolo-marker" :class="{ chosen: selected === marker.id, packed: completed.includes(marker.id) }"
        :data-station="marker.id" :style="{ left: marker.x + 'px', top: marker.y + 'px' }"
        :aria-label="names[marker.id] + (completed.includes(marker.id) ? ', arme utilisée' : ', à venir')"
        @click="emit('select', marker.id)"
      >
        <span class="scolo-marker-code" aria-hidden="true">{{ completed.includes(marker.id) ? '✓' : '?' }}</span>
        <span class="scolo-marker-name">{{ names[marker.id] }}</span>
      </button>
    </template>
  </div>
</template>

<style scoped>
.scolo-diorama { position: relative; width: 100%; height: 100%; min-height: 0; overflow: hidden; background: #e9dfc8; isolation: isolate; }
.scolo-diorama canvas { display: block; width: 100%; height: 100%; touch-action: none; }
.scolo-marker { position: absolute; z-index: 1; transform: translate(-50%, -100%); display: flex; align-items: center; min-height: 44px; gap: 3px; padding: 5px; border: 0; background: transparent; color: #173d38; cursor: pointer; font: 700 12px/1 system-ui, sans-serif; }
.scolo-marker::after { position: absolute; content: ''; width: 2px; height: 8px; background: #264e45; left: 50%; bottom: 0; }
.scolo-marker-code, .scolo-marker-name { display: grid; place-items: center; height: 27px; border: 1.5px solid #24493e; border-radius: 4px; box-shadow: 0 2px 0 #24493e; }
.scolo-marker-code { min-width: 27px; background: #ffd35c; }
.scolo-marker-name { padding: 0 6px; background: #fff6d4; }
.scolo-marker.packed .scolo-marker-code { background: #306b58; color: #fff9dd; }
.scolo-marker.chosen .scolo-marker-name, .scolo-marker:hover .scolo-marker-name { background: #223f3a; color: #fff7d2; }
.scolo-marker:focus-visible { outline: 3px solid #6e3429; outline-offset: 1px; border-radius: 5px; }
@media (max-width: 540px) {
  .scolo-marker { min-width: 44px; justify-content: center; padding: 3px; }
  .scolo-marker-code { min-width: 29px; height: 29px; }
  .scolo-marker-name { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip-path: inset(50%); }
}
</style>
