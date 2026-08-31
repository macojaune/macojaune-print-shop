<template>
  <section class="cho-map-shell" aria-labelledby="cho-map-title" data-cho-map>
    <div class="grid gap-5 border-b border-white/12 px-5 py-6 sm:px-7 lg:grid-cols-12 lg:items-end lg:px-8">
      <h3 id="cho-map-title" class="max-w-[9ch] font-display text-4xl uppercase leading-[0.9] text-white sm:text-5xl lg:col-span-7">
        La carte
      </h3>
      <p class="mb-0 max-w-[35rem] text-sm leading-6 text-stone-300 lg:col-span-5">
        J'y mets seulement les lieux que je veux dévoiler. Pour les autres, faudra attendre les indices.
      </p>
    </div>

    <div class="relative min-h-[31rem] overflow-hidden bg-stone-950 sm:min-h-[38rem]">
      <div
        v-if="hasMapboxToken"
        ref="mapContainer"
        class="absolute inset-0"
        role="region"
        :aria-label="mapAriaLabel"
      />

      <div
        v-if="hasMapboxToken && isLoading"
        class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-stone-950"
      >
        <p class="mb-0 text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
          Je charge la carte
        </p>
      </div>

      <div
        v-if="hasMapboxToken && mapError"
        class="absolute inset-0 z-20 flex items-center justify-center bg-stone-950 px-6 text-center"
      >
        <div>
          <p class="mb-0 font-display text-4xl uppercase leading-none text-white">
            La carte ne charge pas
          </p>
          <p class="mx-auto mb-0 mt-4 max-w-[32rem] text-sm leading-6 text-stone-300">
            Les lieux indiqués sont toujours juste en dessous.
          </p>
        </div>
      </div>

      <div
        v-if="!hasMapboxToken"
        class="map-placeholder absolute inset-0 flex items-center justify-center px-6 text-center"
      >
        <div class="relative z-10 max-w-[34rem] border border-amber-200/30 bg-black/80 px-6 py-8 shadow-[0_18px_55px_rgba(0,0,0,0.5)] sm:px-9 sm:py-10">
          <svg class="mx-auto h-12 w-12 text-amber-300" viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <path d="M24 44S39 30.4 39 17A15 15 0 1 0 9 17c0 13.4 15 27 15 27Z" stroke="currentColor" stroke-width="3" />
            <circle cx="24" cy="17" r="5" stroke="currentColor" stroke-width="3" />
          </svg>
          <p class="mb-0 mt-6 font-display text-4xl uppercase leading-none text-white sm:text-5xl">
            Pas encore de carte.
          </p>
          <p class="mb-0 mt-5 text-sm leading-6 text-stone-300">
            Elle apparaîtra ici dès que j'aurai ajouté le premier lieu.
          </p>
        </div>
      </div>

      <div class="pointer-events-none absolute left-4 top-4 z-10 border border-white/15 bg-black/85 px-4 py-3 backdrop-blur-sm sm:left-6 sm:top-6">
        <p class="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-400">
          Sur la carte
        </p>
        <p class="mb-0 font-display text-3xl uppercase leading-none text-white">
          {{ mappedPrints.length }} {{ mappedPrints.length > 1 ? 'positions' : 'position' }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Map as MapboxMap, Marker } from 'mapbox-gl'
import type { ChoKachePrint } from '../../data/cho-kache'

const props = defineProps<{
  prints: ChoKachePrint[]
}>()

const runtimeConfig = useRuntimeConfig()
const mapContainer = ref<HTMLElement | null>(null)
const isLoading = ref(true)
const mapError = ref(false)
let map: MapboxMap | undefined
let markers: Marker[] = []

const mapboxConfig = computed(() => runtimeConfig.public.mapbox as {
  accessToken?: string
  styleUrl?: string
})
const hasMapboxToken = computed(() => Boolean(mapboxConfig.value.accessToken?.trim()))

const mappedPrints = computed(() => props.prints.filter((print) => {
  if (print.location.visibility !== 'public') {
    return false
  }

  return Number.isFinite(print.location.latitude) && Number.isFinite(print.location.longitude)
}))

const mapAriaLabel = computed(() => mappedPrints.value.length
  ? `Carte de Guadeloupe avec ${mappedPrints.value.length} ${mappedPrints.value.length > 1 ? 'positions publiques' : 'position publique'} Cho Kaché.`
  : 'Carte de Guadeloupe. Aucune coordonnée publique n’est encore renseignée.')

const clearMarkers = () => {
  markers.forEach(marker => marker.remove())
  markers = []
}

onMounted(async () => {
  if (!hasMapboxToken.value || !mapContainer.value) {
    isLoading.value = false
    return
  }

  try {
    const mapboxgl = await import('mapbox-gl')
    const styleUrl = mapboxConfig.value.styleUrl?.trim() || 'mapbox://styles/mapbox/standard'
    const usesStandardStyle = styleUrl === 'mapbox://styles/mapbox/standard'

    map = new mapboxgl.Map({
      accessToken: mapboxConfig.value.accessToken,
      container: mapContainer.value,
      style: styleUrl,
      center: [-61.551, 16.265],
      zoom: 8.35,
      minZoom: 7.5,
      maxZoom: 17,
      cooperativeGestures: true,
      attributionControl: false,
      ...(usesStandardStyle
        ? {
            config: {
              basemap: {
                theme: 'monochrome',
                lightPreset: 'night',
                colorLand: '#1c1917',
                colorWater: '#020617',
                colorGreenspace: '#292524',
                colorRoads: '#57534e',
                colorMotorways: '#fbbf24',
                showPointOfInterestLabels: false,
                showTransitLabels: false,
                show3dObjects: false,
              },
            },
          }
        : {}),
    })

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right')
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left')

    map.once('load', () => {
      if (!map) {
        return
      }

      clearMarkers()

      const bounds = new mapboxgl.LngLatBounds()
      mappedPrints.value.forEach((print) => {
        if (print.location.visibility !== 'public'
          || !Number.isFinite(print.location.latitude)
          || !Number.isFinite(print.location.longitude)) {
          return
        }

        const coordinates: [number, number] = [print.location.longitude!, print.location.latitude!]
        const markerElement = document.createElement('button')
        markerElement.type = 'button'
        markerElement.className = 'cho-map-marker'
        markerElement.setAttribute('aria-label', `Photo n°${print.publicNumber}, ${print.location.label}`)
        markerElement.textContent = `N°${print.publicNumber}`

        const popupContent = document.createElement('div')
        popupContent.className = 'cho-map-popup'
        const popupId = document.createElement('p')
        popupId.className = 'cho-map-popup-id'
        popupId.textContent = `Photo n°${print.publicNumber}`
        const popupLocation = document.createElement('p')
        popupLocation.className = 'cho-map-popup-location'
        popupLocation.textContent = print.location.label
        const popupDetail = document.createElement('p')
        popupDetail.className = 'cho-map-popup-detail'
        popupDetail.textContent = print.location.detail
        popupContent.append(popupId, popupLocation, popupDetail)

        const popup = new mapboxgl.Popup({ offset: 28, closeButton: false })
          .setDOMContent(popupContent)

        const marker = new mapboxgl.Marker({ element: markerElement, anchor: 'bottom' })
          .setLngLat(coordinates)
          .setPopup(popup)
          .addTo(map!)

        markers.push(marker)
        bounds.extend(coordinates)
      })

      if (mappedPrints.value.length === 1) {
        map.easeTo({ center: bounds.getCenter(), zoom: 12, duration: 900 })
      } else if (mappedPrints.value.length > 1) {
        map.fitBounds(bounds, { padding: 90, maxZoom: 13, duration: 900 })
      }

      isLoading.value = false
    })

    map.on('error', () => {
      if (isLoading.value) {
        mapError.value = true
        isLoading.value = false
      }
    })
  } catch {
    mapError.value = true
    isLoading.value = false
  }
})

onBeforeUnmount(() => {
  clearMarkers()
  map?.remove()
  map = undefined
})
</script>

<style scoped>
.cho-map-shell {
  overflow: hidden;
  border: 1px solid rgb(253 230 138 / 0.16);
  background: #0c0a09;
  box-shadow: 0 30px 80px rgb(0 0 0 / 0.32);
}

.map-placeholder {
  background-color: #0c0a09;
  background-image:
    radial-gradient(circle at 28% 35%, rgb(251 191 36 / 0.14), transparent 22%),
    linear-gradient(28deg, transparent 45%, rgb(251 191 36 / 0.08) 46%, rgb(251 191 36 / 0.08) 47%, transparent 48%),
    linear-gradient(132deg, transparent 37%, rgb(255 255 255 / 0.05) 38%, rgb(255 255 255 / 0.05) 39%, transparent 40%);
  background-size: auto, 9rem 9rem, 12rem 12rem;
}

:global(.cho-map-marker) {
  position: relative;
  min-width: 4.5rem;
  min-height: 2.75rem;
  border: 2px solid #000;
  padding: 0.55rem 0.75rem;
  background: #fbbf24;
  box-shadow: 0 10px 30px rgb(0 0 0 / 0.48);
  color: #000;
  cursor: pointer;
  font-family: Tanker, sans-serif;
  font-size: 1.25rem;
  line-height: 1;
  letter-spacing: 0.03em;
  transform: rotate(-1deg);
}

:global(.cho-map-marker::after) {
  position: absolute;
  left: 50%;
  bottom: -0.65rem;
  width: 1rem;
  height: 1rem;
  border-right: 2px solid #000;
  border-bottom: 2px solid #000;
  background: #fbbf24;
  content: '';
  transform: translateX(-50%) rotate(45deg);
}

:global(.cho-map-marker:hover),
:global(.cho-map-marker:focus-visible) {
  background: #fde68a;
}

:global(.cho-map-marker:focus-visible) {
  outline: 3px solid #fff;
  outline-offset: 3px;
}

:global(.mapboxgl-popup-content) {
  border: 1px solid rgb(253 230 138 / 0.35);
  border-radius: 0;
  padding: 1rem 1.1rem;
  background: #0c0a09;
  box-shadow: 0 18px 50px rgb(0 0 0 / 0.52);
  color: #fff;
}

:global(.mapboxgl-popup-tip) {
  border-top-color: #0c0a09 !important;
}

:global(.cho-map-popup-id),
:global(.cho-map-popup-location),
:global(.cho-map-popup-detail) {
  margin: 0;
}

:global(.cho-map-popup-id) {
  color: #fbbf24;
  font-family: Tanker, sans-serif;
  font-size: 1.6rem;
  line-height: 1;
}

:global(.cho-map-popup-location) {
  margin-top: 0.35rem;
  color: #fff;
  font-family: Tanker, sans-serif;
  font-size: 1.25rem;
  line-height: 1;
  text-transform: uppercase;
}

:global(.cho-map-popup-detail) {
  margin-top: 0.45rem;
  color: #d6d3d1;
  font-family: inherit;
  font-size: 0.78rem;
  line-height: 1.45;
}

:global(.mapboxgl-ctrl-group) {
  overflow: hidden;
  border: 1px solid rgb(253 230 138 / 0.24);
  border-radius: 0;
  background: #0c0a09;
}

:global(.mapboxgl-ctrl-group button) {
  background-color: #0c0a09;
}

:global(.mapboxgl-ctrl-group button + button) {
  border-top-color: rgb(253 230 138 / 0.18);
}

:global(.mapboxgl-ctrl-icon) {
  filter: invert(86%) sepia(57%) saturate(887%) hue-rotate(341deg) brightness(104%);
}
</style>
