<template>
  <div class="jarry-map" data-jarry-map>
    <div
      ref="surface"
      class="jarry-map__surface"
      :tabindex="active ? 0 : -1"
      role="group"
      aria-label="Monde à explorer en 3D. Faites glisser pour explorer, pincez pour zoomer. Au clavier, utilisez les flèches, plus, moins et la touche Début."
    />
    <div class="jarry-map__labels" :aria-hidden="!active">
      <template v-for="marker in markers" :key="marker.id">
        <button
          v-if="placesById[marker.id]"
          type="button"
          class="jarry-marker"
          :class="{
            'is-offscreen': !marker.visible,
            'is-open': placesById[marker.id].available,
            'is-selected': selected === marker.id,
            'is-repaired': marker.id === 'quilivreou' && repaired,
          }"
          :style="markerStyle(marker)"
          :tabindex="active && marker.visible ? 0 : -1"
          :data-project="marker.id"
          :aria-label="`${placesById[marker.id].name}, ${marker.id === 'quilivreou' && repaired ? 'activité reprise, ' : ''}explorer ce lieu`"
          :aria-pressed="selected === marker.id"
          :title="placesById[marker.id].name"
          @click="emit('select', marker.id)"
        >
          <GameIcon :name="placesById[marker.id].icon" :size="24" />
          <span v-if="placesById[marker.id].available" class="jarry-marker__light" aria-hidden="true" />
          <span class="jarry-marker__stem" aria-hidden="true" />
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import GameIcon from './GameIcon.vue'
import { places } from '../../lib/macomisyon/places.js'

const props = defineProps({
  paused: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  repaired: { type: Boolean, default: false },
  selected: { type: String, default: null },
})
const emit = defineEmits(['select', 'ready', 'error'])
const surface = ref(null)
const markers = ref([])
const placesById = Object.fromEntries(places.map(place => [place.id, place]))
let world = null
let unmounted = false

const markerStyle = marker => ({ left: `${marker.x}px`, top: `${marker.y}px` })

onMounted(async () => {
  try {
    const { createJarryWorld } = await import('../../lib/macomisyon/jarry-world.js')
    if (unmounted || !surface.value) return
    world = createJarryWorld(surface.value, {
      onSelect: id => emit('select', id),
      onLabels: next => { markers.value = next },
      onError: error => emit('error', error),
      onReady: () => emit('ready'),
    })
    world.setPaused(props.paused)
    world.setActive(props.active)
    world.setRepaired(props.repaired)
    emit('ready')
  } catch (error) {
    world?.dispose()
    world = null
    emit('error', error)
  }
})

watch(() => props.paused, value => world?.setPaused(value))
watch(() => props.active, value => world?.setActive(value))
watch(() => props.repaired, value => world?.setRepaired(value))

onBeforeUnmount(() => {
  unmounted = true
  world?.dispose()
  world = null
})

defineExpose({
  focusProject: id => world?.focusProject(id) ?? Promise.resolve(),
  resetView: () => world?.resetView() ?? Promise.resolve(),
  zoomBy: factor => world?.zoomBy(factor),
  getView: () => world?.getView(),
  getDebug: () => world?.getDebug(),
  setView: view => world?.setView(view),
})
</script>

<style scoped>
.jarry-map, .jarry-map__surface, .jarry-map__labels { position: absolute; inset: 0; }
.jarry-map { overflow: hidden; isolation: isolate; }
.jarry-map__surface { touch-action: none; cursor: grab; }
.jarry-map__surface:active { cursor: grabbing; }
.jarry-map__surface:focus-visible { outline: 3px solid #d4aa20; outline-offset: -5px; }
.jarry-map__surface :deep(canvas) { display: block; width: 100%; height: 100%; }
.jarry-map__labels { pointer-events: none; }
.jarry-marker {
  position: absolute; transform: translate(-50%, -100%); display: grid; place-items: center;
  width: 46px; height: 46px; padding: 0; border: 2px solid #365b54; border-radius: 3px;
  background: #f1ebd3; color: #173b3c; box-shadow: 2px 3px 0 #365b54;
  cursor: pointer; pointer-events: auto; font-family: inherit;
  transition: background-color 150ms, box-shadow 150ms;
}
.jarry-marker.is-open { background: #ffd33d; }
.jarry-marker.is-repaired { background: #c8df8e; }
.jarry-marker:hover, .jarry-marker:focus-visible, .jarry-marker.is-selected {
  background: #fff0a7; box-shadow: 3px 4px 0 #223c40; outline: 3px solid #fff5cf; outline-offset: 3px; z-index: 2;
}
.jarry-marker__light { position: absolute; right: -4px; top: -4px; width: 9px; height: 9px; border: 2px solid #173b3c; background: #ffcc43; }
.is-repaired .jarry-marker__light { background: #b5df7b; }
.jarry-marker__stem { position: absolute; top: calc(100% + 2px); left: calc(50% - 1px); width: 2px; height: 16px; background: #365b54; }
.jarry-marker__stem::after { position: absolute; bottom: -3px; left: -3px; width: 8px; height: 8px; border: 2px solid #365b54; border-radius: 50%; background: #f1ebd3; content: ''; }
.is-offscreen { visibility: hidden; pointer-events: none; }
</style>
