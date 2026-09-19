<script setup lang="ts">
import GameIcon from '../../components/macomisyon/GameIcon.vue'
import { createStore } from '../../lib/macomisyon/depot/model.js'
import { places } from '../../lib/macomisyon/places.js'

definePageMeta({ layout: false, pageTransition: false })
useSeoMeta({
  title: "Maco'misyon · Un monde à découvrir",
  description: "Un monde à explorer. Des lieux à découvrir, des Komisyon à accomplir et des projets qui prennent vie.",
  robots: 'noindex, nofollow',
})

type MapView = { target: number[]; zoom: number }
type MapHandle = { focusProject: (id: string) => Promise<unknown>; resetView: () => void; zoomBy: (factor: number) => void; getView: () => MapView | undefined; setView: (view: MapView) => Promise<unknown> }
const route = useRoute()
const router = useRouter()
const map = ref<MapHandle | null>(null)
const inDepot = computed(() => route.query.lieu === 'depot-q')
const selected = ref<string | null>(null)
const panel = ref<'places' | 'help' | null>(null)
const paused = ref(false)
const loaded = ref(false)
const mapError = ref(false)
const depotRepaired = ref(false)
const entering = ref(false)
const liveMessage = ref('')
const enterButton = ref<HTMLButtonElement | null>(null)
const backButton = ref<HTMLButtonElement | null>(null)
let alive = true
let savedMapView: MapView | undefined

const currentPlace = computed(() => places.find(place => place.id === selected.value))

onMounted(() => {
  try { paused.value = localStorage.getItem('macomisyon-motion') === 'paused' } catch { /* Storage is optional. */ }
  depotRepaired.value = createStore().getState().repaired
})
onBeforeUnmount(() => { alive = false })
watch(paused, value => {
  try { localStorage.setItem('macomisyon-motion', value ? 'paused' : 'running') } catch { /* Storage is optional. */ }
})
watch(inDepot, async value => {
  panel.value = null
  if (!value && !selected.value) selected.value = 'quilivreou'
  await nextTick()
  if (!alive) return
  if (value) backButton.value?.focus({ preventScroll: true })
  else {
    if (savedMapView) await map.value?.setView(savedMapView)
    if (alive) enterButton.value?.focus({ preventScroll: true })
  }
})

async function selectPlace(id: string) {
  if (!places.some(place => place.id === id)) return
  selected.value = id
  panel.value = null
  await map.value?.focusProject(id)
  if (!alive) return
  liveMessage.value = currentPlace.value?.available ? 'Le hangar est repéré. Tu peux entrer.' : `${currentPlace.value?.name}. Ce lieu est encore fermé.`
}

async function enterDepot() {
  if (entering.value) return
  entering.value = true
  savedMapView = map.value?.getView()
  try {
    if (!mapError.value) await map.value?.focusProject('quilivreou')
    if (!alive) return
    await router.push({ path: '/macomisyon', query: { ...route.query, lieu: 'depot-q' } })
  } finally { entering.value = false }
}

function leaveDepot() {
  const query = { ...route.query }
  delete query.lieu
  return router.push({ path: '/macomisyon', query })
}

function resetMap() {
  selected.value = null
  panel.value = null
  map.value?.resetView()
}

function togglePanel(next: 'places' | 'help') {
  panel.value = panel.value === next ? null : next
}
</script>

<template>
  <main class="maco-game" @keydown.esc="panel = null">
    <!-- THESIS: Real coastal geography becomes a fictional world, with projects discovered inside buildings.
    OWN-WORLD: Macojaune amber and Tanker, sage industrial game panels, a turquoise island.
    STORY: Explore the unnamed world, inspect a landmark, enter the warehouse to reveal its project.
    FIRST VIEWPORT: A full-height miniature framed by a compact title, camera controls and one project dock.
    FORM: Extension of the approved Depot Q game, code-first interactive Three.js scene.
    FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance -->
    <a class="game-skip" href="#project-access">Aller aux lieux</a>
    <header class="game-header">
      <NuxtLink to="/" class="site-return" aria-label="Retour sur Macojaune"><GameIcon name="back" /><span>Macojaune</span></NuxtLink>
      <h1>Maco’misyon<span aria-hidden="true">.</span></h1>
      <span class="demo-stamp">Démo<span>en construction</span></span>
    </header>

    <section class="game-console" :class="{ 'is-depot': inDepot }" aria-label="Le monde de Maco’misyon">
      <div class="console-topline">
        <button v-if="inDepot" ref="backButton" class="world-back" type="button" @click="leaveDepot"><GameIcon name="back" />Retour au monde</button>
        <span v-else class="world-address"><span class="signal-dot" aria-hidden="true" />Exploration libre</span>
        <button class="motion-control" type="button" :aria-pressed="paused" :aria-label="paused ? 'Reprendre les animations' : 'Mettre les animations en pause'" @click="paused = !paused"><GameIcon :name="paused ? 'play' : 'pause'" :size="16" />{{ paused ? 'Reprendre' : 'Pause' }}</button>
      </div>

      <div class="game-stage">
        <div v-show="!inDepot" class="world-layer">
          <ClientOnly>
            <MacomisyonJarryMap ref="map" :paused="paused" :active="!inDepot" :repaired="depotRepaired" :selected="selected" @select="selectPlace" @ready="loaded = true; mapError = false" @error="mapError = true" />
          </ClientOnly>
          <div v-if="!loaded && !mapError" class="world-loading" aria-live="polite"><strong>On ouvre la carte.</strong><span>Les lumières s’allument.</span></div>
          <div v-if="mapError" class="world-loading world-fallback" role="status"><GameIcon name="map" :size="40" /><strong>La vue 3D est indisponible.</strong><span>La vue 3D n’a pas démarré. Tu peux quand même ouvrir les lieux et leurs Komisyon.</span><button type="button" class="game-button" @click="togglePanel('places')">Voir les lieux</button></div>

          <div class="map-title" aria-hidden="true"><span>Terre<br>inconnue.</span><small>À toi d’explorer.</small></div>
          <div class="map-tools" aria-label="Commandes de la carte">
            <button type="button" title="Zoomer" aria-label="Zoomer" :disabled="!loaded || mapError" @click="map?.zoomBy(1.2)"><GameIcon name="plus" /></button>
            <button type="button" title="Dézoomer" aria-label="Dézoomer" :disabled="!loaded || mapError" @click="map?.zoomBy(1 / 1.2)"><GameIcon name="minus" /></button>
            <button type="button" title="Recentrer" aria-label="Recentrer la carte" :disabled="!loaded || mapError" @click="resetMap"><GameIcon name="locate" /></button>
          </div>
          <nav class="map-tabs" aria-label="Explorer les lieux">
            <button type="button" :aria-expanded="panel === 'places'" aria-controls="places-panel" @click="togglePanel('places')"><GameIcon name="map" :size="18" />Les lieux</button>
            <button type="button" :aria-expanded="panel === 'help'" aria-controls="help-panel" aria-label="Comment explorer la carte" @click="togglePanel('help')"><GameIcon name="help" :size="18" /></button>
          </nav>

          <section v-if="panel === 'places'" id="places-panel" class="map-panel" aria-labelledby="places-title">
            <div class="panel-title"><h2 id="places-title">Les lieux</h2><button type="button" aria-label="Fermer les lieux" @click="panel = null"><GameIcon name="close" /></button></div>
            <p>Des portes à pousser, des indices à suivre. Choisis un lieu pour t’en approcher.</p>
            <ul><li v-for="place in places" :key="place.id"><button type="button" class="place-row" @click="selectPlace(place.id)"><span class="place-letter" :class="{ muted: !place.available }"><GameIcon :name="place.icon" :size="24" /></span><span><strong>{{ place.name }}</strong><small>{{ place.available ? 'Une porte est ouverte' : 'Encore fermé' }}</small></span><GameIcon :name="place.available ? 'arrow' : 'lock'" :size="18" /></button></li></ul>
          </section>
          <section v-if="panel === 'help'" id="help-panel" class="map-panel help-panel" aria-labelledby="help-title">
            <div class="panel-title"><h2 id="help-title">À toi d’explorer</h2><button type="button" aria-label="Fermer l’aide" @click="panel = null"><GameIcon name="close" /></button></div>
            <p>Déplace la carte avec un doigt. Pince avec deux doigts pour zoomer, ou utilise les boutons.</p>
            <p>Touche un lieu pour le repérer, puis entre quand ses portes sont ouvertes.</p>
            <p class="keyboard-help">Au clavier : flèches pour déplacer la carte, + et − pour zoomer, Début pour recentrer. Les lieux sont aussi accessibles par leurs boutons.</p>
            <p class="demo-explanation">Cette première démo utilise des compteurs fictifs. Tes essais ne créent aucune contribution réelle.</p>
          </section>
        </div>

        <ClientOnly v-if="inDepot">
          <LazyMacomisyonDepotQ :paused="paused" @state-change="depotRepaired = $event.repaired" />
          <template #fallback><div class="world-loading"><strong>La porte s’ouvre.</strong><span>La cargaison arrive.</span></div></template>
        </ClientOnly>
      </div>

      <div v-show="!inDepot" id="project-access" class="project-dock" tabindex="-1">
        <span class="dock-emblem" aria-hidden="true"><GameIcon :name="currentPlace?.icon || 'map'" :size="30" /></span>
        <div class="dock-copy">
          <h2>{{ currentPlace ? currentPlace.name : 'Un monde à découvrir.' }}</h2>
          <p>{{ currentPlace ? currentPlace.description : 'Touche un repère pour t’en approcher et découvrir ce qu’il abrite.' }}</p>
        </div>
        <button v-if="currentPlace?.available" ref="enterButton" type="button" class="enter-depot" :disabled="entering" @click="enterDepot">{{ entering ? 'On y va…' : 'Entrer au dépôt' }}<GameIcon name="arrow" /></button>
        <button v-else-if="currentPlace" type="button" class="closed-place" @click="selectPlace('quilivreou')"><GameIcon name="lock" :size="16" />Lieu fermé<span>Approcher le hangar</span></button>
        <button v-else type="button" class="enter-depot" @click="togglePanel('places')">Explorer les lieux<GameIcon name="map" /></button>
      </div>
    </section>

    <footer class="game-footer"><span>{{ inDepot ? 'QuiLivreOù · Le Dépôt Q' : 'Des lieux familiers. Une autre histoire.' }}</span><span>Première exploration · données de démo</span></footer>
    <p class="game-live" aria-live="polite">{{ liveMessage }}</p>
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
.game-header { width: 100%; max-width: 1480px; margin: 0 auto; height: 84px; flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.game-header h1 { font: 400 clamp(27px, 3.8vw, 44px)/1 Tanker, sans-serif; letter-spacing: .015em; color: var(--game-yellow); margin: 0; }
.game-header h1 span { color: var(--game-paper); }
.site-return { display: inline-flex; align-items: center; gap: 9px; min-height: 44px; text-decoration: none; color: var(--game-paper); font-size: 12px; font-weight: 500; }
.site-return:hover { color: var(--game-yellow); }
.demo-stamp { border: 1px solid #657269; padding: 6px 10px; text-transform: uppercase; color: #e8dcc1; font-size: 11px; line-height: 1.1; text-align: right; }
.demo-stamp span { display: block; text-transform: none; font-size: 9px; padding-top: 3px; }
.game-console { display: flex; flex: 1; flex-direction: column; min-height: 0; width: 100%; max-width: 1480px; margin: 0 auto; overflow: hidden; border-radius: 18px 18px 5px 5px; border: 2px solid #4c6057; background: var(--game-ink); box-shadow: 0 22px 48px #0005; }
.console-topline { position: relative; display: flex; justify-content: space-between; align-items: center; height: 43px; flex-shrink: 0; padding: 0 18px; background: var(--game-ink); color: var(--game-paper); border-bottom: 1px solid #ffffff24; }
.world-address { display: flex; align-items: center; gap: 8px; text-transform: uppercase; font-size: 10px; letter-spacing: .11em; }
.signal-dot { width: 6px; height: 6px; background: var(--game-yellow); }
.motion-control, .world-back { display: flex; align-items: center; justify-content: center; gap: 7px; min-height: 40px; background: none; border: 0; padding: 4px 0; font-size: 11px !important; color: var(--game-paper); }
.world-back { font-weight: 600 !important; }
.game-stage { flex: 1; min-height: 0; position: relative; overflow: hidden; background: #cae0ca; }
.world-layer { position: absolute; inset: 0; }
.map-title { position: absolute; left: 30px; top: 23px; color: #143c3e; pointer-events: none; }
.map-title > span { display: block; font: 400 clamp(32px, 3.5vw, 52px)/.92 Tanker, sans-serif; letter-spacing: -.02em; }
.map-title small { display: block; font-size: 12px; line-height: 1.4; margin-top: 10px; }
.map-tools { position: absolute; display: flex; flex-direction: column; right: 18px; top: 20px; border: 1px solid #23474b; background: #f1ebd3; }
.map-tools button { display: grid; place-items: center; width: 44px; height: 44px; background: none; border: 0; color: #183d3e; }
.map-tools button + button { border-top: 1px solid #23474b40; }
.map-tools button:hover { background: #ffcf43; }
.map-tabs { position: absolute; left: 22px; bottom: 20px; display: flex; gap: 7px; }
.map-tabs button { display: inline-flex; gap: 9px; align-items: center; justify-content: center; min-height: 44px; min-width: 44px; padding: 0 13px; border: 1px solid #21474b; background: var(--game-paper); color: #173b3c; font-weight: 600; font-size: 12px; }
.map-tabs button[aria-expanded='true'], .map-tabs button:hover { background: var(--game-yellow); }
.world-loading { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; background: #cadfcc; color: #173b3c; padding: 30px; text-align: center; }
.world-loading strong { font: 400 36px/1.1 Tanker, sans-serif; }
.world-loading span { max-width: 32ch; font-size: 14px; }
.world-fallback { z-index: 2; }
.world-fallback .game-button { min-height: 44px; padding: 10px 20px; margin-top: 12px; background: #173b3c; color: #f1ebd3; border: 0; }
.map-panel { position: absolute; left: 22px; bottom: 75px; width: min(360px, calc(100% - 44px)); max-height: calc(100% - 100px); overflow-y: auto; background: #173b3c; color: var(--game-paper); border: 1px solid #718a74; padding: 20px; box-shadow: 0 12px 30px #11242440; z-index: 4; scrollbar-color: #ffcf43 #173b3c; scrollbar-width: thin; }
.panel-title { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.panel-title h2 { color: var(--game-yellow); margin: 0; font: 400 32px/1 Tanker, sans-serif; letter-spacing: 0; }
.panel-title button { background: none; color: var(--game-paper); display: grid; place-items: center; border: 0; width: 44px; height: 44px; }
.map-panel p { color: var(--game-paper); margin: 12px 0; font-size: 13px; line-height: 1.55; }
.map-panel ul { list-style: none; margin: 20px 0 0; padding: 0; }
.place-row { display: flex; align-items: center; gap: 13px; padding: 14px 0; width: 100%; text-align: left; border: 0; border-top: 1px solid #8aa79755; background: none; color: var(--game-paper); }
.place-row > span:nth-child(2) { flex: 1; }
.place-row strong { display: block; font-size: 14px; }
.place-row small { display: block; color: #c9d6c6; margin-top: 4px; font-size: 11px; }
.place-letter { display: grid; place-items: center; height: 42px; width: 42px; color: var(--game-ink); background: var(--game-yellow); font: 400 32px/1 Tanker, sans-serif; }
.place-letter.muted { background: #a3b5a2; }
.help-panel .demo-explanation { color: #ffda75; border-top: 1px solid #8aa79755; padding-top: 15px; }
.help-panel .keyboard-help { color: #c9d6c6; font-size: 12px; }
.project-dock { flex-shrink: 0; display: flex; align-items: center; gap: 18px; min-height: 108px; padding: 20px 24px; background: #173b3c; border-top: 1px solid #ffffff24; }
.dock-emblem { display: grid; place-items: center; flex-shrink: 0; width: 60px; height: 60px; background: var(--game-yellow); color: #173b3c; font: 400 52px/.9 Tanker, sans-serif; transform: rotate(-4deg); }
.dock-copy { flex: 1; }
.dock-copy h2 { font: 400 28px/1 Tanker, sans-serif; color: var(--game-paper); margin: 0; letter-spacing: .01em; }
.dock-copy p { margin: 6px 0 0; color: #cfdbc9; max-width: 62ch; font-size: 12px; line-height: 1.5; }
.enter-depot { display: flex; align-items: center; justify-content: center; gap: 20px; min-height: 50px; flex-shrink: 0; padding: 10px 20px; border: 0; background: var(--game-yellow); color: #143c3e; font-size: 13px !important; font-weight: 700 !important; }
.enter-depot:hover { background: #ffe292; }
.closed-place { border: 0; background: transparent; color: #d4dfce; display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 50px; padding: 5px 10px; flex-wrap: wrap; max-width: 160px; font-size: 12px !important; }
.closed-place span { display: block; color: var(--game-yellow); font-size: 10px; }
.game-footer { min-height: 45px; max-width: 1480px; width: 100%; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 16px; color: #b4c1b5; font-size: 10px; }
.game-live, .game-skip { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.game-skip:focus { width: auto; height: auto; clip-path: none; left: 20px; top: 20px; margin: 0; padding: 15px; background: #ffcf43; color: #173b3c; z-index: 20; }
@media (min-width: 1600px) { .maco-game { padding-top: 10px; padding-bottom: 12px; } }
@media (max-width: 700px) {
  .maco-game { min-height: 560px; padding: 0; }
  .game-header { height: 64px; padding: 0 15px; }
  .game-header h1 { font-size: 29px; }
  .site-return span { display: none; }
  .site-return { width: 38px; }
  .demo-stamp { padding: 4px 6px; font-size: 9px; }
  .demo-stamp span { font-size: 8px; }
  .game-console { border-left: 0; border-right: 0; border-radius: 0; }
  .console-topline { padding: 0 14px; height: 39px; }
  .world-address { font-size: 9px; letter-spacing: .04em; }
  .map-title { left: 18px; top: 18px; }
  .map-title > span { font-size: 32px; }
  .map-title small { font-size: 10px; margin-top: 6px; }
  .map-tools { right: 12px; top: 15px; }
  .map-tools button { height: 40px; width: 40px; }
  .map-tabs { left: 14px; bottom: 13px; }
  .map-panel { left: 14px; bottom: 65px; width: calc(100% - 28px); padding: 16px; }
  .project-dock { display: grid; grid-template-columns: 43px 1fr; gap: 8px 13px; padding: 13px 16px max(14px, env(safe-area-inset-bottom)); min-height: 150px; }
  .dock-emblem { width: 43px; height: 43px; font-size: 38px; }
  .dock-copy h2 { font-size: 23px; }
  .dock-copy p { font-size: 11px; line-height: 1.4; margin-top: 5px; }
  .enter-depot, .closed-place { grid-column: 1 / -1; min-height: 44px; width: 100%; max-width: none; font-size: 12px !important; }
  .closed-place span { font-size: 11px; }
  .game-footer { padding: 0 15px; min-height: 28px; font-size: 8px; gap: 8px; }
  .game-footer > span:first-child { display: none; }
  .game-footer > span:last-child { margin-left: auto; }
}
@media (max-height: 600px) and (min-width: 701px) { .maco-game { min-height: 450px; } .game-header { height: 56px; } .project-dock { min-height: 80px; padding: 10px 20px; } .game-footer { min-height: 25px; } }
</style>
