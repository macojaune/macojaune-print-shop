<script setup lang="ts">
import GameIcon from '../../components/macomisyon/GameIcon.vue'
import { STORAGE_KEY as DEPOT_STORAGE_KEY, createStore } from '../../lib/macomisyon/depot/model.js'
import { createScoloStore, missions as scoloMissions } from '../../lib/macomisyon/scolo/model.js'
import { places } from '../../lib/macomisyon/places.js'
import type { Place } from '../../lib/macomisyon/places.js'
import { BANK_GOALS, BANK_STORAGE_KEY, createBankStore } from '../../lib/macomisyon/bank/model.js'
import { registerDevSections } from '../../lib/macomisyon/dev-tools.js'

definePageMeta({ layout: 'macomisyon', pageTransition: false })
useSeoMeta({
  title: "Maco'misyon · Un monde à découvrir",
  description: "Un monde à explorer. Des lieux à découvrir, des Komisyon à accomplir et des projets qui prennent vie.",
  robots: 'noindex, nofollow',
})

type MapView = { target: number[]; zoom: number }
type MapHandle = { focusProject: (id: string) => Promise<unknown>; resetView: () => void; zoomBy: (factor: number) => void; getView: () => MapView | undefined; setView: (view: MapView) => Promise<unknown>; setBottomInset?: (pixels: number) => void }
const route = useRoute()
const router = useRouter()
const map = ref<MapHandle | null>(null)
const bankState = ref(createBankStore({ storage: null }).getState())
let scoloStore: ReturnType<typeof createScoloStore>
const scoloState = ref(createScoloStore({ storage: null }).getState())
function finishScoloGame(id: string) {
  if (scoloStore) scoloState.value = scoloStore.contribute(id)
}
const bankLoaded = ref(false)
const bankUnlocked = computed(() => bankState.value.completed.includes('curiosity'))
const inDepot = computed(() => route.query.lieu === 'depot-q')
const inBank = computed(() => route.query.lieu === 'bank' && bankUnlocked.value)
const inScolo = computed(() => route.query.lieu === 'scolo')
const interior = computed(() => inDepot.value ? 'depot-q' : inBank.value ? 'bank' : inScolo.value ? 'scolo' : null)
const inInterior = computed(() => !!interior.value)
let bankStore: ReturnType<typeof createBankStore> | undefined
let unsubscribeBank: (() => void) | undefined
const selected = ref<string | null>(null)
const panel = ref<'guide' | 'places' | 'help' | null>(null)
const guideKey = 'macomisyon-guide-v1'
const guideTitle = ref<HTMLHeadingElement | null>(null)
const replayGuideButton = ref<HTMLButtonElement | null>(null)
const sourcesOpen = ref(false)
let guideFromHelp = false
const loaded = ref(false)
const mapError = ref(false)
const depotRepaired = ref(false)
const entering = ref(false)
const liveMessage = ref('')
const enterButton = ref<HTMLButtonElement | null>(null)
const backButton = ref<HTMLButtonElement | null>(null)
const placesTitle = ref<HTMLHeadingElement | null>(null)
const helpTitle = ref<HTMLHeadingElement | null>(null)
const placeTitle = ref<HTMLHeadingElement | null>(null)
const placeWindow = ref<HTMLElement | null>(null)
const placesButton = ref<HTMLButtonElement | null>(null)
const gameStage = ref<HTMLElement | null>(null)
let placeObserver: ResizeObserver | undefined
let panelTrigger: HTMLElement | null = null
let placeTrigger: HTMLElement | null = null
let alive = true
let savedMapView: MapView | undefined

const worldPlaces = computed(() => places.map(place => {
  if (place.id === 'scolo' && scoloState.value.moved) {
    return { ...place, description: 'Le camion a emporté le dernier carton. Le déménagement est terminé.' }
  }
  if (place.id === 'quilivreou' && depotRepaired.value) {
    return { ...place, description: 'Le gyrophare s’est éteint et la camionnette repart en livraison. Tu peux entrer.' }
  }
  if (place.id === 'memebank' && bankUnlocked.value) {
    return { ...place, available: true, description: 'Le rideau est levé. On entend un drôle de remue-ménage derrière le guichet. Entre pour découvrir ce qui se cache ici.' }
  }
  return place
}))
const currentPlace = computed(() => worldPlaces.value.find(place => place.id === selected.value))

function placeStatus(place: Place) {
  if (place.kind === 'discovery') return 'À découvrir sur la carte'
  if (place.kind === 'external') return 'Site du studio à découvrir'
  return place.available ? 'Une porte est ouverte' : 'Encore fermé'
}

onMounted(() => {
  depotRepaired.value = createStore().getState().repaired
  scoloStore = createScoloStore()
  scoloState.value = scoloStore.getState()
  bankStore = createBankStore()
  bankState.value = bankStore.getState()
  bankLoaded.value = true
  unsubscribeBank = bankStore.subscribe(next => { bankState.value = next })
  unregisterDev = registerDevSections('world', devWorldSections)
  if (!route.query.lieu) {
    try { if (localStorage.getItem(guideKey) === 'seen') return } catch { /* Storage may be disabled. */ }
    void showGuide()
  }
})
onBeforeUnmount(() => {
  alive = false
  placeObserver?.disconnect()
  unsubscribeBank?.()
  unregisterDev?.()
})

// On narrow screens, leave room for the building immediately above its card.
// A side-by-side card needs no camera offset.
function framePlace() {
  const window = placeWindow.value, stage = gameStage.value
  const bottom = !inInterior.value && window && stage && window.offsetLeft < stage.clientWidth / 2
    ? Math.min(144, stage.clientHeight * .28) : 0
  map.value?.setBottomInset?.(bottom)
}
watch([placeWindow, loaded, inInterior], () => {
  placeObserver?.disconnect()
  if (placeWindow.value && gameStage.value && !inInterior.value && typeof ResizeObserver !== 'undefined') {
    placeObserver = new ResizeObserver(framePlace)
    placeObserver.observe(placeWindow.value)
    placeObserver.observe(gameStage.value)
  }
  framePlace()
}, { flush: 'post' })

watch(interior, async (value, previous) => {
  panel.value = null
  if (!value) selected.value = previous === 'bank' ? 'memebank' : previous === 'scolo' ? 'scolo' : 'quilivreou'
  await nextTick()
  if (!alive) return
  if (value) backButton.value?.focus({ preventScroll: true })
  else {
    if (savedMapView) await map.value?.setView(savedMapView)
    if (alive) (enterButton.value || placeTitle.value)?.focus({ preventScroll: true })
  }
})

async function showGuide() {
  guideFromHelp = panel.value === 'help'
  panel.value = 'guide'
  sourcesOpen.value = false
  await nextTick()
  if (alive && panel.value === 'guide') guideTitle.value?.focus({ preventScroll: true })
}

function rememberGuide() {
  if (panel.value !== 'guide') return
  try { localStorage.setItem(guideKey, 'seen') } catch { /* The map still works for this visit. */ }
}

async function selectPlace(id: string) {
  const place = worldPlaces.value.find(place => place.id === id)
  if (!place) return
  rememberGuide()
  const trigger = document.activeElement
  if (trigger instanceof HTMLElement && trigger !== document.body && !placeWindow.value?.contains(trigger)) placeTrigger = trigger
  else if (!currentPlace.value) placeTrigger = null
  selected.value = id
  panel.value = null
  await nextTick()
  if (!alive || selected.value !== id || panel.value || inInterior.value) return
  placeTitle.value?.focus({ preventScroll: true })
  const announcement = place.kind === 'discovery' ? place.description
    : place.kind === 'external' ? 'Tu peux visiter le site du studio dans un nouvel onglet.'
      : place.available ? 'Tu peux entrer.' : 'Ce lieu est encore fermé.'
  liveMessage.value = `${place.name}. ${announcement}`
  if (!mapError.value) await map.value?.focusProject(id)
}

async function enterPlace() {
  if (entering.value || !currentPlace.value?.available || !currentPlace.value.interior) return
  const place = currentPlace.value
  entering.value = true
  savedMapView = map.value?.getView()
  try {
    if (!mapError.value) await map.value?.focusProject(place.id)
    if (!alive) return
    await router.push({ path: '/macomisyon', query: { ...route.query, lieu: place.interior } })
  } finally { entering.value = false }
}

function leavePlace() {
  const query = { ...route.query }
  delete query.lieu
  return router.push({ path: '/macomisyon', query })
}

watch([() => route.query.lieu, bankUnlocked, bankLoaded], ([lieu, unlocked, ready]) => {
  if (ready && lieu === 'bank' && !unlocked) {
    selected.value = 'memebank'
    const query = { ...route.query }; delete query.lieu
    void router.replace({ path: '/macomisyon', query })
  }
}, { immediate: true })

async function bankAction(action: string, id?: string) {
  const wasUnlocked = bankUnlocked.value
  if (action === 'contribute' && id) bankStore?.contribute(id)
  else if (action === 'qualify') bankStore?.qualify()
  else if (action === 'invite') bankStore?.invite()
  else if (action === 'openBeta') bankStore?.openBeta()
  else if (action === 'scenario' && id) bankStore?.loadScenario(id)
  if (!wasUnlocked && bankUnlocked.value) {
    liveMessage.value = 'Le rideau se lève : tu peux entrer dans la banque.'
    await nextTick()
    if (alive && !inInterior.value) enterButton.value?.focus({ preventScroll: true })
  } else if (id === 'curiosity') liveMessage.value = `${bankState.value.counts.curiosity} visites sur ${BANK_GOALS.curiosity}.`
}

// Simulation controls live in the development panel, outside the product UI.
let unregisterDev: (() => void) | undefined
const devContext = computed(() => inDepot.value ? 'Intérieur · Le Dépôt Q' : inBank.value ? 'Intérieur · La banque' : inScolo.value ? 'Intérieur · La maison aux cartons'
  : currentPlace.value ? 'Carte · ' + currentPlace.value.name : 'Carte')
function presetDepot(id: string) {
  depotRepaired.value = createStore().preset(id).state.repaired
}
function resetEverything() {
  try { for (const key of [guideKey, DEPOT_STORAGE_KEY, BANK_STORAGE_KEY]) localStorage.removeItem(key) } catch { /* Reload anyway. */ }
  scoloStore?.reset()
  window.location.assign('/macomisyon')
}
function devWorldSections() {
  const next = scoloMissions[scoloState.value.completed.length]
  const scolo = {
    id: 'scolo', title: 'La maison aux cartons', context: inScolo.value ? 'interior' as const : 'map' as const, focus: selected.value === 'scolo',
    status: `${scoloState.value.completed.length}/${scoloMissions.length} parties`,
    actions: [
      { id: 'next', label: next ? 'Terminer une partie ' + next.label : 'Toutes les parties sont terminées', disabled: !next, run: () => next && finishScoloGame(next.id) },
      { id: 'moved', label: 'Déménagement terminé (final)', disabled: scoloState.value.moved, run: () => scoloMissions.forEach(mission => finishScoloGame(mission.id)) },
      { id: 'reset', label: 'Réinitialiser la maison', tone: 'reset' as const, run: () => { if (scoloStore) scoloState.value = scoloStore.reset() } },
    ],
  }
  const global = {
    id: 'progress', title: 'Toute la progression', context: 'global' as const,
    actions: [{ id: 'reset-all', label: 'Repartir en nouveau visiteur', tone: 'reset' as const, run: resetEverything }],
  }
  if (inScolo.value) return [scolo, global]
  if (inInterior.value) return [global]
  return [
    {
      id: 'memebank', title: 'La banque', context: 'map' as const, focus: selected.value === 'memebank',
      status: `${bankState.value.counts.curiosity}/${BANK_GOALS.curiosity} visites`,
      actions: [
        { id: 'visit', label: '+1 visite', disabled: !bankLoaded.value, run: () => bankAction('contribute', 'curiosity') },
        { id: 'open', label: 'Lever le rideau', disabled: !bankLoaded.value || bankUnlocked.value, run: () => bankAction('scenario', 'discovered') },
        { id: 'beta', label: 'Coffre VHS ouvert (final)', disabled: !bankLoaded.value, run: () => bankAction('scenario', 'beta') },
        { id: 'reset', label: 'Réinitialiser la banque', tone: 'reset' as const, disabled: !bankLoaded.value, run: () => bankAction('scenario', 'new') },
      ],
    },
    {
      id: 'quilivreou', title: 'Le hangar', context: 'map' as const, focus: selected.value === 'quilivreou',
      status: depotRepaired.value ? 'réparé' : 'à l’arrêt',
      actions: [
        { id: 'repaired', label: 'Dépôt réparé (final)', disabled: depotRepaired.value, run: () => presetDepot('repaired') },
        { id: 'reset', label: 'Réinitialiser le dépôt', tone: 'reset' as const, run: () => presetDepot('start') },
      ],
    },
    scolo, global,
  ]
}

function resetMap() {
  rememberGuide()
  selected.value = null
  panel.value = null
  map.value?.resetView()
}

async function closePanel() {
  if (!panel.value) return
  const wasGuide = panel.value === 'guide'
  const backToHelp = wasGuide && guideFromHelp
  rememberGuide()
  panel.value = backToHelp ? 'help' : null
  sourcesOpen.value = false
  await nextTick()
  if (!alive || inInterior.value) return
  if (backToHelp && panel.value === 'help') replayGuideButton.value?.focus({ preventScroll: true })
  else if (!panel.value) (wasGuide ? placesButton.value : panelTrigger)?.focus({ preventScroll: true })
}

async function closePlace() {
  selected.value = null
  await nextTick()
  if (!alive || inInterior.value || selected.value || panel.value) return
  const triggerVisible = placeTrigger?.isConnected && placeTrigger.getClientRects().length && !placeTrigger.closest('[aria-hidden="true"], [inert], .is-offscreen')
  if (triggerVisible) placeTrigger?.focus({ preventScroll: true })
  else placesButton.value?.focus({ preventScroll: true })
}

function escapePanel(event: KeyboardEvent) {
  if (inInterior.value || (!panel.value && !selected.value)) return
  event.preventDefault()
  event.stopPropagation()
  if (panel.value) void closePanel()
  else void closePlace()
}

async function togglePanel(next: 'places' | 'help', event: MouseEvent) {
  if (panel.value === next) return closePanel()
  rememberGuide()
  sourcesOpen.value = false
  panelTrigger = event.currentTarget as HTMLElement
  selected.value = null
  panel.value = next
  await nextTick()
  if (alive && panel.value === next) (next === 'help' ? helpTitle.value : placesTitle.value)?.focus({ preventScroll: true })
}
</script>

<template>
  <main class="maco-game" @keydown.esc="escapePanel">
    <a class="game-skip" :href="inBank ? '#bank-missions' : inScolo ? '#scolo-missions' : '#project-access'">{{ inBank || inScolo ? 'Aller aux Komisyon' : 'Aller aux lieux' }}</a>
    <header class="game-header">
      <NuxtLink to="/" class="site-return"><GameIcon name="back" :size="16" /><span>Retour au site</span></NuxtLink>
      <h1>Maco’misyon<span aria-hidden="true">.</span></h1>
    </header>

    <section class="game-console" :class="{ 'is-interior': inInterior }" aria-label="Le monde de Maco’misyon">
      <div v-if="inInterior" class="console-topline">
        <button ref="backButton" class="world-back" type="button" @click="leavePlace"><GameIcon name="back" />Retour au monde</button>
      </div>

      <div ref="gameStage" class="game-stage">
        <div v-show="!inInterior" class="world-layer" :class="{ 'has-place': currentPlace && !panel }">
          <ClientOnly>
            <MacomisyonJarryMap ref="map" :active="!inInterior" :bank-state="bankState" :repaired="depotRepaired" :selected="selected" @select="selectPlace" @ready="loaded = true; mapError = false" @error="mapError = true" />
          </ClientOnly>
          <div v-if="!loaded && !mapError" class="world-loading" aria-live="polite"><strong>On ouvre la carte.</strong><span>Les lumières s’allument.</span></div>
          <div v-if="mapError" class="world-loading world-fallback" role="status"><GameIcon name="map" :size="40" /><strong>La vue 3D est indisponible.</strong><span>Tu peux quand même découvrir les lieux et accéder aux Komisyon disponibles depuis la liste.</span><button type="button" class="game-button" @click="togglePanel('places', $event)">Voir les lieux</button></div>

          <div class="map-title"><h2>Découvre<br> mes projets</h2><p>Choisis un lieu sur la carte.</p></div>
          <div class="map-tools" aria-label="Commandes de la carte">
            <button type="button" title="Zoomer" aria-label="Zoomer" :disabled="!loaded || mapError" @click="map?.zoomBy(1.2)"><GameIcon name="plus" /></button>
            <button type="button" title="Dézoomer" aria-label="Dézoomer" :disabled="!loaded || mapError" @click="map?.zoomBy(1 / 1.2)"><GameIcon name="minus" /></button>
            <button type="button" title="Recentrer" aria-label="Recentrer la carte" :disabled="!loaded || mapError" @click="resetMap"><GameIcon name="locate" /></button>
          </div>
          <nav class="map-tabs" aria-label="Explorer les lieux">
            <button id="project-access" ref="placesButton" type="button" :aria-expanded="panel === 'places'" aria-controls="places-panel" @click="togglePanel('places', $event)"><GameIcon name="map" :size="18" />Les lieux</button>
            <button type="button" :aria-expanded="panel === 'help'" aria-controls="help-panel" aria-label="À propos — Comment explorer la carte" @click="togglePanel('help', $event)"><GameIcon name="help" :size="18" />À propos</button>
          </nav>

          <Transition name="map-window" @before-leave="(el: Element) => el.setAttribute('inert', '')">
            <section v-if="panel === 'guide'" id="map-guide" key="guide" class="map-window guide-panel" aria-labelledby="guide-title">
              <div class="panel-title">
                <h2 id="guide-title" ref="guideTitle" tabindex="-1">Prendre la carte en main</h2>
                <button type="button" aria-label="Passer le guide" @click="closePanel"><GameIcon name="close" /></button>
              </div>
              <ol class="guide-steps">
                <li><GameIcon name="locate" /><span class="touch-tip">Glisse avec un doigt pour déplacer la carte. Pince à deux doigts pour zoomer.</span><span class="mouse-tip">Glisse à la souris et zoome à la molette. Au clavier, utilise les flèches et les touches + et −.</span></li>
                <li><GameIcon name="map" /><span class="touch-tip">Touche un repère ou ouvre « Les lieux » pour choisir un bâtiment.</span><span class="mouse-tip">Clique sur un repère ou ouvre « Les lieux » pour choisir un bâtiment.</span></li>
              </ol>
              <button type="button" class="guide-start" @click="closePanel">Explorer la carte<GameIcon name="arrow" :size="17" /></button>
              <a class="guide-credit" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">Carte © OpenStreetMap contributors</a>
            </section>
            <section v-else-if="panel === 'places'" id="places-panel" key="places" class="map-panel" aria-labelledby="places-title">
              <div class="panel-title"><h2 id="places-title" ref="placesTitle" tabindex="-1">Les lieux</h2><button type="button" aria-label="Fermer les lieux" @click="closePanel"><GameIcon name="close" /></button></div>
              <p>Choisis un lieu pour le repérer et découvrir sa fiche.</p>
              <ul><li v-for="place in worldPlaces" :key="place.id"><button type="button" class="place-row" @click="selectPlace(place.id)"><span class="place-letter" :class="{ muted: !place.available && !place.kind }"><GameIcon :name="place.icon" :size="24" /></span><span><strong>{{ place.name }}</strong><small>{{ placeStatus(place) }}</small></span><GameIcon :name="place.available || place.kind ? 'arrow' : 'lock'" :size="18" /></button></li></ul>
            </section>
            <section v-else-if="panel === 'help'" id="help-panel" key="help" class="map-panel help-panel" aria-labelledby="help-title">
              <div class="panel-title"><h2 id="help-title" ref="helpTitle" tabindex="-1">À propos</h2><button type="button" aria-label="Fermer l’aide" @click="closePanel"><GameIcon name="close" /></button></div>
              <p>Choisis un repère sur la carte ou un bâtiment dans « Les lieux ». Sa fiche indique si tu peux entrer.</p>
              <p class="keyboard-help">Au clavier, utilise Tab pour atteindre la carte, les flèches pour la déplacer, + et − pour zoomer, et Début pour recentrer.</p>
              <button ref="replayGuideButton" type="button" class="replay-guide" @click="showGuide">Revoir le guide<GameIcon name="arrow" :size="16" /></button>
              <section class="map-sources" aria-labelledby="map-sources-title">
                <h3><button id="map-sources-title" type="button" :aria-expanded="sourcesOpen" aria-controls="map-sources" @click="sourcesOpen = !sourcesOpen">La carte et ses sources<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="m3 6 5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" /></svg></button></h3>
                <div id="map-sources" class="sources-collapse" :class="{ expanded: sourcesOpen }" :inert="!sourcesOpen" :aria-hidden="!sourcesOpen">
                  <div class="sources-body">
                    <p>Les rues, la végétation et le relief suivent la géographie réelle. Les bâtiments des projets sont imaginaires ; les autres hauteurs sont estimées quand elles ne sont pas renseignées.</p>
                    <ul>
                      <li><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors</a> — rues, bâtiments, végétation et littoral. Données sous <a href="https://opendatacommons.org/licenses/odbl/1-0/" target="_blank" rel="noopener noreferrer">ODbL 1.0</a>.</li>
                      <li><a href="https://geoservices.ign.fr/rgealti" target="_blank" rel="noopener noreferrer">© IGN — RGE ALTI®</a> — relief terrestre. Données consultées le 22 octobre 2026 via la Géoplateforme. <a href="https://github.com/etalab/licence-ouverte/blob/master/LO.md" target="_blank" rel="noopener noreferrer">Licence Ouverte 2.0</a>.</li>
                      <li><a href="https://registry.opendata.aws/terrain-tiles/" target="_blank" rel="noopener noreferrer">Terrain Tiles — Mapzen / AWS Open Data</a> — complément du relief. Données SRTM et GMTED2010 fournies par l’U.S. Geological Survey. <a href="https://github.com/tilezen/joerd/blob/master/docs/attribution.md" target="_blank" rel="noopener noreferrer">Sources et licences</a>.</li>
                    </ul>
                  </div>
                </div>
              </section>
            </section>
          </Transition>
          <section v-if="currentPlace && !panel" :key="currentPlace.id" ref="placeWindow" class="project-dock place-detail" aria-labelledby="place-detail-title">
            <header class="place-detail-bar">
              <GameIcon :name="currentPlace.icon" :size="26" />
              <h2 id="place-detail-title" ref="placeTitle" tabindex="-1">{{ currentPlace.name }}</h2>
              <button type="button" aria-label="Fermer la fiche du lieu" @click="closePlace"><GameIcon name="close" /></button>
            </header>
            <div class="place-detail-content">
              <p>{{ currentPlace.description }}</p>
              <a v-if="currentPlace?.kind === 'external' && currentPlace.externalUrl && currentPlace.externalLabel" class="enter-depot" :href="currentPlace.externalUrl" target="_blank" rel="noopener noreferrer" :aria-label="`${currentPlace.externalLabel} (nouvel onglet)`">{{ currentPlace.externalLabel }}<GameIcon name="external" /></a>
              <button v-else-if="currentPlace?.available && currentPlace.interior" ref="enterButton" type="button" class="enter-depot" :disabled="entering" @click="enterPlace">{{ entering ? 'On y va…' : currentPlace.enterLabel }}<GameIcon name="arrow" /></button>
              <div v-else-if="selected === 'memebank'" class="bank-curiosity">
                <span>Curiosité · {{ bankState.counts.curiosity }} / {{ BANK_GOALS.curiosity }} visites</span>
              </div>
              <button v-else-if="currentPlace && !currentPlace.kind" type="button" class="closed-place" @click="selectPlace('quilivreou')"><GameIcon name="lock" :size="16" />Lieu fermé<span>Approcher le hangar</span></button>
            </div>
          </section>
        </div>

        <LazyMacomisyonScoloHouse v-if="inScolo" :state="scoloState" />
        <ClientOnly v-if="inBank">
          <LazyMacomisyonMemeBank :state="bankState" @action="bankAction" />
          <template #fallback><div class="world-loading"><strong>On pousse la porte.</strong><span>Le sérieux est sous surveillance.</span></div></template>
        </ClientOnly>
        <ClientOnly v-if="inDepot">
          <LazyMacomisyonDepotQ @state-change="depotRepaired = $event.repaired" />
          <template #fallback><div class="world-loading"><strong>La porte s’ouvre.</strong><span>La cargaison arrive.</span></div></template>
        </ClientOnly>
      </div>
    </section>

    <footer class="game-footer">
      <span v-if="inInterior" class="interior-name">{{ inDepot ? 'QuiLivreOù · Le Dépôt Q' : inBank ? 'Memebank · Le casse du sérieux' : 'Scolo · Le dernier carton' }}</span>
      <a class="feedback-link" href="https://tally.so/r/WJzDrJ" target="_blank" rel="noopener noreferrer">Signaler un bug ou une amélioration</a>
    </footer>
    <p class="game-live" aria-live="polite">{{ liveMessage }}</p>
    <ClientOnly><MacomisyonDevPanel :context="devContext" /></ClientOnly>
    <noscript>Active JavaScript pour explorer ce monde, entrer dans ses bâtiments et découvrir leurs Komisyon.</noscript>
  </main>
</template>

<style scoped>
.maco-game { --game-ink: #173b3c; --game-yellow: #ffcf43; --game-paper: #f1ebd3; position: relative; display: flex; flex-direction: column; width: 100%; min-height: 680px; height: 100svh; height: 100dvh; padding: 0 32px; overflow: hidden; background: #101b1c; color: var(--game-paper); font-family: 'Space Grotesk', sans-serif; isolation: isolate; }
.maco-game *, .maco-game *::before, .maco-game *::after { box-sizing: border-box; }
.maco-game ::selection { background: var(--game-yellow); color: var(--game-ink); }
.maco-game button { font: inherit; cursor: pointer; }
.maco-game button:disabled { cursor: default; opacity: .5; }
.maco-game :is(button, a):focus-visible { outline: 3px solid var(--game-yellow); outline-offset: 4px; }
/* Headings only receive focus programmatically, to announce a new window. */
.maco-game [tabindex='-1']:focus { outline: none; }
.game-header { width: 100%; max-width: 1480px; margin: 0 auto; height: 84px; flex-shrink: 0; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 12px; }
.game-header h1 { font: 400 clamp(27px, 3.8vw, 44px)/1 Tanker, sans-serif; letter-spacing: .015em; color: var(--game-yellow); margin: 0; }
.game-header h1 span { color: var(--game-paper); }
.site-return { justify-self: start; display: inline-flex; align-items: center; gap: 9px; min-height: 44px; text-decoration: none; color: var(--game-paper); font-size: 12px; font-weight: 500; }
.site-return:hover { color: var(--game-yellow); }
.game-console { display: flex; flex: 1; flex-direction: column; min-height: 0; width: 100%; max-width: 1480px; margin: 0 auto; overflow: hidden; border-radius: 18px 18px 5px 5px; border: 2px solid #4c6057; background: var(--game-ink); box-shadow: 0 22px 48px #0005; }
.console-topline { position: relative; display: flex; justify-content: space-between; align-items: center; height: 43px; flex-shrink: 0; padding: 0 18px; background: var(--game-ink); color: var(--game-paper); border-bottom: 1px solid #ffffff24; }
.world-back { display: flex; align-items: center; justify-content: center; gap: 7px; min-height: 40px; background: none; border: 0; padding: 4px 0; font-size: 11px !important; color: var(--game-paper); }
.world-back { font-weight: 600 !important; }
.game-stage { flex: 1; min-height: 0; position: relative; overflow: hidden; background: #cae0ca; }
.world-layer { position: absolute; inset: 0; }
.feedback-link { display: inline-flex; align-items: center; min-height: 24px; margin-left: auto; color: inherit; font-size: 11px; text-decoration: underline; text-underline-offset: 2px; }
.map-title { position: absolute; left: 30px; top: 23px; color: #143c3e; pointer-events: none; }
.map-title h2 { margin: 0; font: 400 clamp(32px, 3.5vw, 52px)/.92 Tanker, sans-serif; letter-spacing: -.02em; }
.map-title p { color: inherit; margin: 10px 0 0; font-size: 12px; line-height: 1.4; }
.map-tools { position: absolute; display: flex; flex-direction: column; right: 18px; top: 20px; border: 1px solid #23474b; background: #f1ebd3; }
.map-tools button { display: grid; place-items: center; width: 44px; height: 44px; background: none; border: 0; color: #183d3e; }
.map-tools button + button { border-top: 1px solid #23474b40; }
.map-tools button:hover { background: #ffcf43; }
.map-tabs { position: absolute; left: 22px; bottom: 20px; display: flex; gap: 7px; z-index: 3; }
.map-tabs button { display: inline-flex; gap: 9px; align-items: center; justify-content: center; min-height: 44px; min-width: 44px; padding: 0 13px; border: 1px solid #21474b; background: var(--game-paper); color: #173b3c; font-weight: 600; font-size: 12px; }
.map-tabs button[aria-expanded='true'], .map-tabs button:hover { background: var(--game-yellow); }
.world-loading { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; background: #cadfcc; color: #173b3c; padding: 30px; text-align: center; }
.world-loading strong { font: 400 36px/1.1 Tanker, sans-serif; }
.world-loading span { max-width: 32ch; font-size: 14px; }
.world-fallback { z-index: 2; }
.world-fallback .game-button { min-height: 44px; padding: 10px 20px; margin-top: 12px; background: #173b3c; color: #f1ebd3; border: 0; }
.map-panel, .guide-panel { position: absolute; left: 22px; bottom: 75px; width: min(360px, calc(100% - 44px)); max-height: calc(100% - 100px); overflow-y: auto; overscroll-behavior: contain; overflow-wrap: anywhere; background: #173b3c; color: var(--game-paper); border: 1px solid #718a74; padding: 20px; box-shadow: 0 12px 30px #11242440; z-index: 4; scrollbar-color: #ffcf43 #173b3c; scrollbar-width: thin; }
.panel-title { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.panel-title h2 { color: var(--game-yellow); margin: 0; font: 400 32px/1 Tanker, sans-serif; letter-spacing: 0; }
.panel-title button { background: none; color: var(--game-paper); display: grid; place-items: center; flex-shrink: 0; border: 0; width: 44px; height: 44px; }
.map-panel p { color: var(--game-paper); margin: 12px 0; font-size: 13px; line-height: 1.55; }
.map-panel ul { list-style: none; margin: 20px 0 0; padding: 0; }
.place-row { display: flex; align-items: center; gap: 13px; padding: 14px 0; width: 100%; text-align: left; border: 0; border-top: 1px solid #8aa79755; background: none; color: var(--game-paper); }
.place-row > span:nth-child(2) { flex: 1; }
.place-row strong { display: block; font-size: 14px; }
.place-row small { display: block; color: #c9d6c6; margin-top: 4px; font-size: 11px; }
.place-letter { display: grid; place-items: center; height: 42px; width: 42px; color: var(--game-ink); background: var(--game-yellow); font: 400 32px/1 Tanker, sans-serif; }
.place-letter.muted { background: #a3b5a2; }

.help-panel .keyboard-help { color: #c9d6c6; font-size: 12px; }
.help-panel { scroll-padding-top: 60px; scroll-padding-bottom: 12px; }
.help-panel .panel-title { position: sticky; top: 0; z-index: 1; background: var(--game-ink); }
.help-panel h3 { margin: 20px 0 10px; color: var(--game-yellow); font-size: 14px; line-height: 1.4; }
.map-sources { border-top: 1px solid #8aa79755; margin-top: 18px; }
.map-sources h3 { margin: 0; }
#map-sources-title, .replay-guide { display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; min-height: 44px; padding: 5px 0; color: var(--game-paper); background: none; border: 0; text-align: left; }
#map-sources-title { font-size: 13px; font-weight: 700; }
#map-sources-title svg { transition: transform .25s ease; }
#map-sources-title[aria-expanded=true] svg { transform: rotate(180deg); }
.replay-guide { width: fit-content; font-size: 13px; text-decoration: underline; text-underline-offset: 3px; }
.sources-collapse { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows .25s cubic-bezier(.2,.72,.22,1), opacity .2s ease; }
.sources-collapse.expanded { grid-template-rows: 1fr; opacity: 1; }
.sources-body { min-height: 0; overflow: hidden; }
.map-window-enter-active { transition: transform .28s cubic-bezier(.16,1,.3,1), opacity .2s ease-out; }
.map-window-leave-active { pointer-events: none; transition: transform .17s ease-in, opacity .15s ease-in; }
.map-window-enter-from, .map-window-leave-to { opacity: 0; transform: translateY(22px); }
.guide-panel { width: min(345px, calc(100% - 44px)); border-top: 4px solid var(--game-yellow); }
.guide-steps { list-style: none; padding: 0; margin: 12px 0 18px; display: grid; gap: 15px; }
.guide-steps li { display: flex; align-items: flex-start; gap: 12px; font-size: 13px; line-height: 1.5; }
.guide-steps svg { color: var(--game-yellow); flex-shrink: 0; margin-top: 2px; }
.touch-tip { display: none; }
@media (pointer: coarse) { .touch-tip { display: inline; } .mouse-tip { display: none; } }
.guide-start { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 44px; width: 100%; padding: 8px 14px; background: var(--game-yellow); color: var(--game-ink); font-weight: 700 !important; border: 0; }
.guide-credit { display: inline-block; padding: 8px 0 0; color: #ced8c8; font-size: 11px; text-underline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  .map-window-enter-active, .map-window-leave-active, .sources-collapse, #map-sources-title svg { transition: none; }
  .map-window-enter-from, .map-window-leave-to { transform: none; }
}
.map-sources ul { margin: 12px 0 0; }
.map-sources li { margin: 14px 0 0; font-size: 12px; line-height: 1.6; }
.map-sources a { color: var(--game-paper); text-decoration: underline; text-underline-offset: 3px; }
.map-sources a:hover { color: var(--game-yellow); }
/* A non-modal window follows the selection while the map remains interactive. */
.place-detail { position: absolute; left: calc(50% + 48px); top: max(12px, calc(50% - 76px)); width: min(360px, calc(50% - 118px)); max-height: calc(50% + 64px); display: flex; flex-direction: column; z-index: 4; overflow: hidden; background: var(--game-ink); color: var(--game-paper); border-radius: 2px; box-shadow: 0 18px 44px #081c16a8; animation: place-reveal .22s cubic-bezier(.16,1,.3,1); }
.place-detail-bar { display: flex; align-items: center; gap: 12px; flex-shrink: 0; padding: 12px 8px 12px 20px; background: #37513f; color: var(--game-yellow); }
.place-detail-bar > svg { flex-shrink: 0; }
.place-detail-bar h2 { flex: 1; min-width: 0; margin: 0; font: 400 30px/1.05 Tanker, sans-serif; letter-spacing: .01em; overflow-wrap: anywhere; text-wrap: balance; }
.place-detail-bar button { display: grid; place-items: center; flex-shrink: 0; width: 44px; height: 44px; border: 0; background: none; color: var(--game-paper); }
.place-detail-bar button:hover { background: var(--game-ink); color: var(--game-yellow); }
.place-detail-content { min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 20px; scrollbar-color: #c9b675 var(--game-ink); scrollbar-width: thin; }
.place-detail-content > p { margin: 0; font-size: 14px; line-height: 1.65; color: var(--game-paper); }
.place-detail-content > :is(.enter-depot, .bank-curiosity, .closed-place) { margin-top: 20px; }
.place-detail .enter-depot { width: 100%; gap: 12px; justify-content: space-between; }
.place-detail .closed-place { max-width: none; width: 100%; justify-content: flex-start; padding: 10px 0; }
.has-place .map-title { display: none; }
@keyframes place-reveal { from { opacity: .65; transform: translateX(12px); } to { opacity: 1; transform: translateX(0); } }
@media (prefers-reduced-motion: reduce) { .place-detail { animation: none; } }
.enter-depot { display: flex; align-items: center; justify-content: center; gap: 20px; min-height: 50px; flex-shrink: 0; padding: 10px 20px; border: 0; background: var(--game-yellow); color: #143c3e; font-size: 13px !important; font-weight: 700 !important; text-decoration: none; }
.enter-depot:hover { background: #ffe292; }
.bank-curiosity { display: grid; gap: 8px; min-width: 0; color: var(--game-paper); }
.bank-curiosity > span { font-size: 12px; font-variant-numeric: tabular-nums; }
.bank-curiosity small { font-size: 10px; color: #cfdbc9; }
.closed-place { border: 0; background: transparent; color: #d4dfce; display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 50px; padding: 5px 10px; flex-wrap: wrap; max-width: 160px; font-size: 12px !important; }
.closed-place span { display: block; color: var(--game-yellow); font-size: 10px; }
.game-footer { min-height: 45px; max-width: 1480px; width: 100%; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 16px; color: #b4c1b5; font-size: 10px; }
.game-live, .game-skip { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.game-skip:focus { width: auto; height: auto; clip-path: none; left: 20px; top: 20px; margin: 0; padding: 15px; background: #ffcf43; color: #173b3c; z-index: 20; }
@media (max-width: 1100px) {

  .place-detail-bar { padding: 8px 8px 8px 16px; }
  .place-detail-bar h2 { font-size: 26px; }
  .place-detail-content { padding: 16px; }
  .place-detail-content > p { font-size: 13px; }
  .place-detail-content > :is(.enter-depot, .bank-curiosity, .closed-place) { margin-top: 16px; }
  @keyframes place-reveal { from { opacity: .65; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
}
@media (min-width: 1600px) { .maco-game { padding-top: 10px; padding-bottom: 12px; } }
@media (max-width: 700px) {
  .maco-game { min-height: 560px; padding: 0; }
  .game-header { height: 64px; padding: 0 15px; column-gap: 6px; }
  .game-header h1 { font-size: 29px; }
  .site-return { gap: 4px; line-height: 1.2; }
  .game-console { border-left: 0; border-right: 0; border-radius: 0; }
  .console-topline { padding: 0 14px; height: 39px; }
  .map-title { left: 18px; top: 18px; }
  .map-title h2 { font-size: 32px; }
  .map-title p { font-size: 10px; margin-top: 6px; }
  .map-tools { right: 12px; top: 15px; }
  .place-detail { top: 50%; left: 0; right: 0; margin-inline: auto; width: min(390px, calc(100% - 28px)); max-height: calc(50% - 65px); }
  .map-tools button { height: 44px; width: 44px; }
  .map-tabs { left: 14px; bottom: 13px; }
  .map-panel, .guide-panel { left: 14px; bottom: 65px; width: calc(100% - 28px); padding: 16px; }
  .bank-curiosity { grid-column: 1 / -1; min-width: 0; }
  .enter-depot, .closed-place { grid-column: 1 / -1; min-height: 44px; width: 100%; max-width: none; font-size: 12px !important; }
  .closed-place span { font-size: 11px; }
  .game-footer { padding: 0 15px; min-height: 28px; font-size: 8px; gap: 8px; }
  .interior-name { display: none; }
}
@media (max-height: 600px) and (min-width: 701px) {
  .maco-game { min-height: 450px; }
  .game-header { height: 56px; }
  .game-footer { min-height: 25px; }
}
@media (orientation: landscape) and (max-height: 500px) {
  .maco-game { min-height: 100svh; padding: 0; }
  .game-header { height: 44px; padding: 0 14px; }
  .game-footer { min-height: 24px; padding: 0 14px; }
  .interior-name { display: none; }
  .console-topline { height: 36px; }
  .place-detail { left: calc(50% + 40px); right: auto; margin: 0; top: max(8px, calc(50% - 76px)); width: min(320px, calc(50% - 106px)); max-height: calc(50% + 68px); }
  .map-tools { top: 8px; right: 10px; }
  .map-title { top: 10px; }
}
</style>
