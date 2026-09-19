<template>
  <div class="jarry-map" data-jarry-map>
    <div
      ref="surface"
      class="jarry-map__surface"
      :tabindex="active ? 0 : -1"
      role="group"
      aria-label="Carte 3D de Jarry. Faites glisser pour explorer, pincez pour zoomer. Au clavier, utilisez les flèches, plus, moins et la touche Début."
    />
    <div class="jarry-map__labels" :aria-hidden="!active">
      <template v-for="marker in markers" :key="marker.id">
        <span
          v-if="marker.id === 'la-jaille'"
          class="jarry-place"
          :class="{ 'is-offscreen': !marker.visible }"
          :style="markerStyle(marker)"
        >
          <span class="jarry-place__coordinates">16°15′ N · 61°34′ O</span>
          La Jaille
          <span class="jarry-place__stem" />
        </span>
        <button
          v-else
          type="button"
          class="jarry-marker"
          :class="[
            `jarry-marker--${marker.id}`,
            { 'is-offscreen': !marker.visible, 'is-repaired': marker.id === 'quilivreou' && repaired },
          ]"
          :style="markerStyle(marker)"
          :tabindex="active && marker.visible ? 0 : -1"
          :data-project="marker.id"
          :aria-label="marker.id === 'quilivreou' ? 'Entrer dans le Dépôt Q, projet QuiLivreOù' : `${names[marker.id]}, découvrir cet emplacement`"
          @click="emit('select', marker.id)"
        >
          <span class="jarry-marker__symbol" aria-hidden="true">
            <template v-if="marker.id === 'quilivreou'">Q</template>
            <svg v-else-if="marker.id === 'shootareas'" viewBox="0 0 24 24" fill="none">
              <path d="M3 7h5l2-3h5l2 3h4v13H3z" stroke="currentColor" stroke-width="2" />
              <circle cx="12" cy="13" r="4" stroke="currentColor" stroke-width="2" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none">
              <path d="M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5z" stroke="currentColor" stroke-width="2" />
              <path d="M12 14v3" stroke="currentColor" stroke-width="2" />
            </svg>
          </span>
          <span class="jarry-marker__copy">
            <span class="jarry-marker__eyebrow">{{ marker.id === 'quilivreou' ? (repaired ? 'Dépôt opérationnel' : 'Dépôt à réveiller') : 'Prochain territoire' }}</span>
            <span class="jarry-marker__name">{{ names[marker.id] }}</span>
          </span>
          <svg v-if="marker.id === 'quilivreou'" class="jarry-marker__arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 18 18 6M6 6h12v12" stroke="currentColor" stroke-width="2" />
          </svg>
          <span class="jarry-marker__stem" />
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  paused: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  repaired: { type: Boolean, default: false },
})
const emit = defineEmits(['select', 'ready', 'error'])
const surface = ref(null)
const markers = ref([])
const names = { quilivreou: 'QuiLivreOù', shootareas: 'Shootareas', zikak: 'Zikak' }
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
.jarry-map,
.jarry-map__surface,
.jarry-map__labels {
  position: absolute;
  inset: 0;
}

.jarry-map {
  overflow: hidden;
  isolation: isolate;
}

.jarry-map__surface {
  touch-action: none;
  cursor: grab;
}

.jarry-map__surface:active {
  cursor: grabbing;
}

.jarry-map__surface:focus-visible {
  outline: 3px solid #d4aa20;
  outline-offset: -5px;
}

.jarry-map__surface :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}

.jarry-map__labels {
  pointer-events: none;
}

.jarry-marker,
.jarry-place {
  position: absolute;
  transform: translate(-50%, -100%);
  white-space: nowrap;
}

.jarry-marker {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 48px;
  padding: 6px 11px 6px 6px;
  border: 2px solid #223c40;
  border-radius: 3px;
  background: #ffd33d;
  box-shadow: 3px 4px 0 #223c40;
  color: #223c40;
  text-align: left;
  cursor: pointer;
  pointer-events: auto;
  font-family: inherit;
  transition: background-color 150ms, box-shadow 150ms;
}

.jarry-marker:hover,
.jarry-marker:focus-visible {
  background: #fff0a7;
  box-shadow: 4px 5px 0 #223c40;
  outline: 3px solid #fff5cf;
  outline-offset: 3px;
  z-index: 2;
}

.jarry-marker__symbol {
  display: grid;
  place-items: center;
  flex: none;
  width: 35px;
  height: 35px;
  border: 1px solid #223c40;
  background: #fff4b5;
  font-family: 'Tanker', 'Space Grotesk', sans-serif;
  font-size: 30px;
  line-height: 1;
}

.jarry-marker__symbol svg {
  width: 22px;
  height: 22px;
}

.jarry-marker__copy {
  display: grid;
  gap: 4px;
}

.jarry-marker__eyebrow {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 8px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.jarry-marker__name {
  font-family: 'Tanker', 'Space Grotesk', sans-serif;
  font-size: 21px;
  line-height: 1;
  letter-spacing: 0.025em;
}

.jarry-marker__arrow {
  margin-left: 5px;
  width: 22px;
  height: 22px;
}

.jarry-marker__stem {
  position: absolute;
  top: calc(100% + 2px);
  left: calc(50% - 1px);
  width: 2px;
  height: 21px;
  background: #223c40;
}

.jarry-marker__stem::after {
  position: absolute;
  bottom: -3px;
  left: -3px;
  width: 8px;
  height: 8px;
  border: 2px solid #223c40;
  border-radius: 50%;
  background: #ffd33d;
  content: '';
}

.jarry-marker--shootareas,
.jarry-marker--zikak {
  min-height: 42px;
  padding: 4px 8px 4px 4px;
  border-color: #5a706c;
  background: #e3e8d5;
  box-shadow: 2px 3px 0 #5a706c;
}

.jarry-marker--shootareas .jarry-marker__symbol,
.jarry-marker--zikak .jarry-marker__symbol {
  width: 30px;
  height: 30px;
  border-color: #81938b;
  background: #eef0df;
}

.jarry-marker--shootareas .jarry-marker__name,
.jarry-marker--zikak .jarry-marker__name {
  font-size: 18px;
}

.jarry-marker--shootareas .jarry-marker__eyebrow,
.jarry-marker--zikak .jarry-marker__eyebrow {
  color: #51645f;
  font-size: 7px;
}

.jarry-marker.is-repaired {
  background: #c8df8e;
}

.jarry-place {
  display: grid;
  gap: 4px;
  padding: 6px 8px;
  border: 1px solid #79958a;
  background: rgb(242 242 218 / 90%);
  color: #40594e;
  font-family: 'Tanker', 'Space Grotesk', sans-serif;
  font-size: 18px;
  letter-spacing: 0.04em;
  text-align: center;
}

.jarry-place__coordinates {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 7px;
  letter-spacing: 0.02em;
}

.jarry-place__stem {
  position: absolute;
  top: 100%;
  left: 50%;
  width: 1px;
  height: 12px;
  background: #79958a;
}

.is-offscreen {
  visibility: hidden;
  pointer-events: none;
}

@media (max-width: 600px) {
  .jarry-marker {
    gap: 6px;
    min-height: 44px;
    padding-right: 8px;
  }

  .jarry-marker__name {
    font-size: 18px;
  }

  .jarry-marker__eyebrow {
    font-size: 7px;
  }

  .jarry-marker__arrow {
    margin-left: 0;
    width: 19px;
    height: 19px;
  }

  .jarry-marker--shootareas .jarry-marker__eyebrow,
  .jarry-marker--zikak .jarry-marker__eyebrow {
    display: none;
  }

  .jarry-marker--shootareas .jarry-marker__name,
  .jarry-marker--zikak .jarry-marker__name {
    font-size: 16px;
  }

  .jarry-place {
    font-size: 15px;
  }
}
</style>
