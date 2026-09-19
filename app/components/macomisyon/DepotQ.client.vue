<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { createStore, initialState, missions, statusFor, completedMainCount, deriveWorldState } from '~/lib/macomisyon/depot/model.js'
import { createWorld } from '~/lib/macomisyon/depot/world.js'

const props = defineProps({ paused: { type: Boolean, default: false } })
const emit = defineEmits(['state-change', 'ready', 'error'])
const viewport = ref(null)
const canvas = ref(null)
const labels = ref(null)
const panelHeading = ref(null)
const inventoryButton = ref(null)
const panel = ref(null)
const selected = ref(null)
const state = ref(initialState())
const error = ref(false)
const loading = ref(true)
const announcement = ref('')
const completedCount = computed(() => completedMainCount(state.value))
const currentMission = computed(() => missions.find(mission => mission.id === selected.value))
const locked = computed(() => currentMission.value && statusFor(currentMission.value.id, state.value) === 'blocked')
const currentCount = computed(() => currentMission.value ? state.value.counts[currentMission.value.id] : 0)
const currentReached = computed(() => currentMission.value && currentCount.value >= currentMission.value.goal)
const paths = {
  people: 'M8 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 21v-4a6 6 0 0 1 12 0v4m1-16a3 3 0 0 1 0 6m2 3a5 5 0 0 1 5 5v2',
  chat: 'M3 4h18v12H9l-6 5V4Zm4 4h10M7 12h6',
  crate: 'm3 7 9-4 9 4v11l-9 4-9-4V7Zm0 0 9 4 9-4m-9 4v11M7.5 5l9 4v5',
  flag: 'M5 22V3h14l-3 5 3 5H5',
  lock: 'M6 10h12v11H6zM8 10V7a4 4 0 0 1 8 0v3',
  check: 'm4 12 5 5L20 5',
  target: 'M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6M8 12h8m-4-4v8',
  arrow: 'M4 12h15m-6-6 6 6-6 6',
  close: 'm6 6 12 12M6 18 18 6',
}
const scenarios = [
  { id: 'start', title: 'Le grand arrêt', text: 'Fenwick renversé, cartons éparpillés, alarme.' },
  { id: 'progress', title: 'L’équipe est là', text: 'Lumières de travail rallumées. Deux étapes restent à accomplir.' },
  { id: 'ahead', title: 'Une longueur d’avance', text: 'Cinq avis déjà reçus. Leur étape attend encore le catalogue.' },
  { id: 'repaired', title: 'Ça repart !', text: 'Trois objectifs atteints. Le Fenwick se relève et livre en boucle.' },
  { id: 'beyond', title: 'Objectifs dépassés', text: 'Le dépôt tourne et les compteurs continuent.' },
]
let world
let store
let unsubscribe
let alive = true
let selectionRequest = 0
let previousFocus = null

function notifyState(next, { animate = true, arrival = false } = {}) {
  const previouslyRepaired = state.value.repaired
  if (next.repaired && !previouslyRepaired && !arrival) {
    selectionRequest++
    panel.value = null
    selected.value = null
    world?.resetView()
    nextTick(() => { if (alive) inventoryButton.value?.focus({ preventScroll: true }) })
  }
  state.value = next
  world?.setState(deriveWorldState(next, selected.value), { animate, arrival })
  emit('state-change', { repaired: next.repaired, completedCount: completedMainCount(next) })
  if (next.repaired && !previouslyRepaired) announcement.value = 'Les trois Komisyon sont accomplies. Le Dépôt Q reprend ses expéditions !'
}

async function openPanel(name) {
  previousFocus = document.activeElement
  panel.value = name
  await nextTick()
  panelHeading.value?.focus({ preventScroll: true })
}

function closePanel() {
  selectionRequest++
  panel.value = null
  selected.value = null
  world?.setState(deriveWorldState(state.value))
  if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
}

async function choose(id) {
  const request = ++selectionRequest
  previousFocus = document.activeElement
  selected.value = id
  panel.value = null
  world?.setState(deriveWorldState(state.value, id))
  if (world && !error.value) await world.focusNode(id)
  if (!alive || request !== selectionRequest) return
  panel.value = id === 'project' ? 'project' : 'mission'
  await nextTick()
  panelHeading.value?.focus({ preventScroll: true })
}

function contribute() {
  if (!currentMission.value || !store) return
  const id = currentMission.value.id
  const eventId = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
  const result = store.contribute(id, eventId)
  if (result.ok && !result.state.repaired) announcement.value = `Action simulée. ${result.state.counts[id]} ${currentMission.value.unit} comptabilisés.`
}

function applyScenario(id) {
  closePanel()
  announcement.value = ''
  world?.resetView()
  store?.preset(id)
}

function contextLost() { error.value = true; emit('error', 'Le contexte 3D du Dépôt Q a été interrompu.') }
function contextRestored() { error.value = false; emit('ready') }
function onKeydown(event) { if (event.key === 'Escape' && panel.value) { event.stopPropagation(); closePanel() } }

watch(() => props.paused, value => world?.setMotionPaused(value))
defineExpose({ getDebug: () => world?.getDebug(), getState: () => state.value })
onMounted(() => {
  store = createStore()
  try {
    world = createWorld({ canvas: canvas.value, container: viewport.value, labels: labels.value, onSelect: choose })
    world.setMotionPaused(props.paused)
    canvas.value.addEventListener('webglcontextlost', contextLost)
    canvas.value.addEventListener('webglcontextrestored', contextRestored)
    emit('ready')
  } catch (cause) {
    error.value = true
    emit('error', cause instanceof Error ? cause.message : 'La scène 3D du Dépôt Q ne peut pas être ouverte.')
  }
  notifyState(store.getState(), { animate: true, arrival: true })
  unsubscribe = store.subscribe(notifyState)
  loading.value = false
})
onBeforeUnmount(() => {
  alive = false
  selectionRequest++
  unsubscribe?.()
  canvas.value?.removeEventListener('webglcontextlost', contextLost)
  canvas.value?.removeEventListener('webglcontextrestored', contextRestored)
  world?.dispose()
})
</script>

<template>
  <div class="depot-q" :data-repaired="state.repaired" :data-completed-count="completedCount" :data-world-error="error" @keydown="onKeydown">
    <div ref="viewport" class="depot-viewport">
      <canvas ref="canvas" class="depot-canvas" role="img" aria-label="Dépôt QuiLivreOù en 3D. Déplace la vue ou choisis une Komisyon dans l’inventaire." />
      <div ref="labels" class="depot-labels" :hidden="error" />
      <div v-if="loading" class="depot-fallback"><p>Ouverture du dépôt…</p></div>
      <div v-else-if="error" class="depot-fallback">
        <span class="depot-fallback-mark" aria-hidden="true">Q</span>
        <h2>Le dépôt reste ouvert.</h2>
        <p>La vue 3D est indisponible sur cet appareil. Tu peux découvrir le projet et essayer toutes les Komisyon ci-dessous.</p>
        <button type="button" class="depot-action" @click="openPanel('project')">Découvrir QuiLivreOù</button>
      </div>
      <div class="depot-scene-tools">
        <button type="button" aria-label="Zoomer dans le dépôt" :disabled="error || loading" @click="world?.zoomBy(1.22)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg></button>
        <button type="button" aria-label="Dézoomer dans le dépôt" :disabled="error || loading" @click="world?.zoomBy(1 / 1.22)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14" /></svg></button>
        <button type="button" aria-label="Recentrer le dépôt" :disabled="error || loading" @click="world?.resetView()"><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="paths.target" /></svg></button>
      </div>
      <div class="depot-demo-strip">
        <span class="depot-simulation">Démo locale</span>
        <button type="button" aria-label="Choisir un scénario de démonstration du dépôt" @click="openPanel('demo')">Changer d’état <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 7 7-7 7" /></svg></button>
      </div>
    </div>

    <footer class="depot-dock">
      <div class="depot-status">
        <div>
          <h2>{{ state.repaired ? 'Le dépôt reprend vie' : 'Dépôt Q à l’arrêt' }}</h2>
          <p>{{ state.repaired ? 'Les colis partent. La suite reste à écrire.' : 'Trois Komisyon pour relancer les expéditions.' }}</p>
        </div>
        <span class="depot-repair-count" :aria-label="`${completedCount} Komisyon principales accomplies sur 3`"><b>{{ completedCount }}</b><span>/ 3</span></span>
      </div>
      <div class="depot-dock-actions">
        <button ref="inventoryButton" type="button" class="depot-action" @click="openPanel('inventory')"><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="paths.crate" /></svg>Les Komisyon<svg viewBox="0 0 24 24" aria-hidden="true"><path :d="paths.arrow" /></svg></button>
        <button type="button" class="depot-project-button" @click="choose('project')"><span aria-hidden="true">Q</span>Le projet</button>
      </div>
    </footer>

    <Transition name="depot-panel">
      <section v-if="panel" class="depot-panel" aria-labelledby="depot-panel-title">
        <header class="depot-panel-bar">
          <span>{{ panel === 'demo' ? 'Console de démo' : panel === 'inventory' ? 'Carnet de Komisyon' : panel === 'project' ? 'Fiche projet' : locked ? 'Indice découvert' : 'Komisyon' }}</span>
          <button type="button" aria-label="Fermer le panneau" @click="closePanel"><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="paths.close" /></svg></button>
        </header>
        <div class="depot-panel-content">
          <template v-if="panel === 'project'">
            <h2 id="depot-panel-title" ref="panelHeading" tabindex="-1">QuiLivreOù</h2>
            <p class="depot-lead">Qui livre vraiment chez nous ?</p>
            <p>Un catalogue de boutiques nourri par des expériences de commande. D’abord en Guadeloupe et en Martinique, pour savoir ce qui arrive vraiment à destination.</p>
            <div class="depot-project-story"><span aria-hidden="true">Q</span><p>Ce Fenwick représente le projet. Quand les trois Komisyon sont accomplies, le chariot se relève, le rideau s’ouvre et les colis repartent.</p></div>
            <a class="depot-action" href="https://quilivreou.marvinl.com" target="_blank" rel="noopener noreferrer">Ouvrir QuiLivreOù<svg viewBox="0 0 24 24" aria-hidden="true"><path :d="paths.arrow" /></svg></a>
            <button type="button" class="depot-text-button" @click="openPanel('inventory')">Voir les Komisyon du dépôt</button>
            <p class="depot-note">Cette visite utilise des compteurs simulés. Elle ne change aucune donnée du site QuiLivreOù.</p>
          </template>

          <template v-else-if="panel === 'inventory'">
            <h2 id="depot-panel-title" ref="panelHeading" tabindex="-1">Réveiller le dépôt</h2>
            <p>Choisis une étape pour la repérer dans l’entrepôt.</p>
            <div class="depot-inventory">
              <button v-for="mission in missions" :key="mission.id" type="button" :data-state="statusFor(mission.id, state)" @click="choose(mission.id)">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="paths[statusFor(mission.id, state) === 'blocked' ? 'lock' : statusFor(mission.id, state) === 'completed' ? 'check' : mission.icon]" /></svg>
                <span class="depot-inventory-copy"><strong>{{ statusFor(mission.id, state) === 'blocked' ? 'Étape verrouillée' : mission.short }}</strong><small>{{ statusFor(mission.id, state) === 'blocked' ? 'Toucher pour trouver un indice' : mission.role === 'bonus' ? 'Bonus facultatif' : statusFor(mission.id, state) === 'completed' ? 'Accomplie' : 'Mission principale' }}</small></span>
                <span class="depot-inventory-count">{{ statusFor(mission.id, state) === 'blocked' ? '?' : `${state.counts[mission.id]}/${mission.goal}` }}</span>
              </button>
            </div>
            <p class="depot-note">Objectifs provisoires : 10 inscriptions, 5 sites et 5 avis. Les inscriptions et les sites avancent en parallèle.</p>
          </template>

          <template v-else-if="panel === 'mission' && currentMission">
            <div class="depot-mission-heading"><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="paths[locked ? 'lock' : currentMission.icon]" /></svg><h2 id="depot-panel-title" ref="panelHeading" tabindex="-1">{{ locked ? 'Étape verrouillée' : currentMission.title }}</h2></div>
            <p>{{ locked ? currentMission.hint : currentMission.description }}</p>
            <div class="depot-goal"><strong>{{ currentCount }}<span>/ {{ currentMission.goal }}</span></strong><span>{{ currentMission.unit }}<br>{{ locked ? 'enregistrés en avance' : currentReached ? 'objectif atteint' : 'objectif de démonstration' }}</span></div>
            <div class="depot-gauge" role="progressbar" :aria-label="`Progression : ${currentMission.unit}`" :aria-valuenow="Math.min(currentCount, currentMission.goal)" :aria-valuemax="currentMission.goal" :aria-valuetext="`${currentCount} sur ${currentMission.goal}${locked ? ', étape verrouillée' : ''}`"><span :style="{ transform: `scaleX(${Math.min(currentCount / currentMission.goal, 1)})` }" /></div>
            <p v-if="locked && currentReached" class="depot-waiting">Le compteur est prêt. L’étape sera validée dès que sa condition sera remplie.</p>
            <div v-else-if="!locked" class="depot-effect"><strong>Dans le dépôt</strong><p>{{ currentMission.effect }}</p></div>
            <button type="button" class="depot-action" @click="contribute"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>{{ currentMission.action }}</button>
            <button type="button" class="depot-text-button" @click="openPanel('inventory')">Toutes les Komisyon</button>
            <p class="depot-note">Simulation enregistrée sur cet appareil. {{ locked ? 'Le compteur avance même quand l’étape est verrouillée.' : currentReached ? 'Les contributions continuent au-delà de l’objectif.' : 'Aucune contribution réelle ni Zikak ne sont créés.' }}</p>
          </template>

          <template v-else-if="panel === 'demo'">
            <h2 id="depot-panel-title" ref="panelHeading" tabindex="-1">Essaie la suite</h2>
            <p>Change l’état de l’entrepôt pour voir les missions et leurs effets. Chaque scénario remplace ta progression locale.</p>
            <div class="depot-scenarios"><button v-for="scenario in scenarios" :key="scenario.id" type="button" @click="applyScenario(scenario.id)"><strong>{{ scenario.title }}</strong><span>{{ scenario.text }}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="paths.arrow" /></svg></button></div>
            <p class="depot-note">Les seuils, l’ordre des étapes et le bonus sont des exemples. Les vraies Komisyon seront définies avant le lancement.</p>
          </template>
        </div>
      </section>
    </Transition>
    <p class="depot-sr-only" role="status" aria-live="polite">{{ announcement }}</p>
  </div>
</template>

<style scoped>
.depot-q{--depot-ink:#1a302a;--depot-sand:#f6edce;--depot-yellow:#ffcf43;--depot-mint:#b6d4b8;position:relative;width:100%;height:100%;min-height:350px;color:var(--depot-sand);font-family:'Space Grotesk',sans-serif;isolation:isolate;background:#49302a}
.depot-q *{box-sizing:border-box}.depot-q ::selection{color:var(--depot-ink);background:var(--depot-yellow)}
.depot-q button,.depot-q a{font:inherit;touch-action:manipulation}.depot-q button{cursor:pointer}.depot-q button:disabled{opacity:.45;cursor:not-allowed}.depot-q :is(button,a):focus-visible{outline:3px solid var(--depot-yellow);outline-offset:4px}.depot-q h2:focus{outline:none}.depot-q svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}
.depot-viewport{position:absolute;inset:0 0 132px;overflow:hidden}.depot-canvas{display:block;width:100%;height:100%;outline:0}.depot-labels{position:absolute;inset:0;pointer-events:none}
.depot-demo-strip{position:absolute;left:16px;top:16px;display:flex;align-items:center;gap:0;max-width:calc(100% - 32px);background:var(--depot-ink);color:var(--depot-sand);font-size:11px;z-index:2}.depot-simulation{padding:8px 12px;border-right:1px solid #788674}.depot-demo-strip button{display:flex;align-items:center;gap:8px;padding:8px 10px;min-height:44px;border:0;background:transparent;color:var(--depot-yellow);font-weight:600}.depot-demo-strip svg{width:16px;height:16px}
.depot-scene-tools{position:absolute;right:16px;bottom:20px;display:flex;flex-direction:column;background:var(--depot-ink);z-index:2}.depot-scene-tools button{display:grid;place-items:center;width:44px;height:44px;background:transparent;color:var(--depot-sand);border:0;border-bottom:1px solid #506657}.depot-scene-tools button:last-child{border:0}.depot-scene-tools button:hover{background:#3c5345}
.depot-dock{position:absolute;bottom:0;left:0;right:0;height:132px;background:var(--depot-ink);padding:15px 20px 16px;border-top:2px solid #7b8661;z-index:3}.depot-status{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:11px}.depot-status h2{font-family:Tanker,sans-serif;font-size:28px;font-weight:400;line-height:1;margin:0;color:var(--depot-yellow)}.depot-status p{font-size:11px;line-height:1.4;margin:5px 0 0;color:#e2dfc7}.depot-repair-count{display:flex;align-items:baseline;gap:6px;white-space:nowrap;font-variant-numeric:tabular-nums}.depot-repair-count b{font-family:Tanker,sans-serif;font-size:35px;font-weight:400;line-height:1;color:var(--depot-yellow)}.depot-repair-count>span{font-size:14px;color:#c3cfad}.depot-dock-actions{display:flex;gap:12px}.depot-action{display:flex;align-items:center;justify-content:center;gap:12px;min-height:44px;padding:10px 14px;border:0;background:var(--depot-yellow);color:#1a302a;text-decoration:none;font-size:12px!important;font-weight:700!important;text-align:center}.depot-action:hover{background:#ffe593}.depot-dock-actions .depot-action{flex:1;justify-content:flex-start}.depot-dock-actions .depot-action svg:last-child{margin-left:auto}.depot-project-button{display:flex;align-items:center;justify-content:center;gap:8px;padding:0 12px;background:transparent;border:1px solid #78917b;color:var(--depot-sand);font-size:12px!important;min-height:44px}.depot-project-button>span{font-family:Tanker,sans-serif;font-size:24px;color:var(--depot-yellow)}.depot-project-button:hover{background:#3c5345}
.depot-panel{position:absolute;right:18px;top:18px;width:min(390px,calc(100% - 36px));max-height:calc(100% - 164px);z-index:5;background:var(--depot-ink);color:var(--depot-sand);display:flex;flex-direction:column;box-shadow:0 18px 44px #081c16a8;overflow:hidden;border-radius:2px}.depot-panel-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-shrink:0;min-height:48px;background:#37513f;color:#f4e2a5;padding:0 8px 0 20px;font-size:11px;font-weight:600}.depot-panel-bar button{display:grid;place-items:center;width:44px;height:44px;background:transparent;border:0;color:var(--depot-sand)}.depot-panel-bar button:hover{color:var(--depot-yellow);background:#1a302a}.depot-panel-content{overflow:auto;padding:23px 23px 24px;scrollbar-width:thin;scrollbar-color:#c9b675 #1a302a;overscroll-behavior:contain}.depot-panel h2{font-family:Tanker,sans-serif;font-weight:400;font-size:36px;line-height:1;letter-spacing:.015em;color:var(--depot-yellow);margin:0 0 18px;text-wrap:balance}.depot-panel p{font-size:13px;line-height:1.65;margin:0 0 18px;color:#f0e9ce}.depot-panel .depot-lead{font-size:17px;color:var(--depot-sand);font-weight:500}.depot-panel .depot-note{font-size:11px;line-height:1.6;color:#cad3ba;margin:20px 0 0}.depot-text-button{display:block;padding:12px 0;min-height:44px;background:transparent;border:0;color:var(--depot-sand);font-size:12px!important;text-decoration:underline;text-underline-offset:4px}.depot-text-button:hover{color:var(--depot-yellow)}
.depot-project-story{display:flex;gap:17px;align-items:flex-start;margin:22px 0 25px;padding:18px 0;border-block:1px solid #566b51}.depot-project-story>span{font-family:Tanker,sans-serif;font-size:55px;line-height:1;color:var(--depot-yellow)}.depot-project-story p{margin:0;font-size:12px}.depot-inventory{display:flex;flex-direction:column;gap:2px}.depot-inventory button{display:flex;align-items:center;text-align:left;gap:13px;background:#344a3a;color:var(--depot-sand);border:0;min-height:74px;padding:12px}.depot-inventory button:hover{background:#4a5e43}.depot-inventory button[data-state=completed]{color:#d3e8b8}.depot-inventory button[data-state=blocked]{background:#283c32;color:#c4cdbb}.depot-inventory button>svg{width:26px;height:26px}.depot-inventory-copy{flex:1}.depot-inventory strong{display:block;font-family:Tanker,sans-serif;font-size:23px;line-height:1.1;font-weight:400}.depot-inventory small{display:block;margin-top:5px;font-size:10px;line-height:1.45}.depot-inventory-count{font-size:15px;font-variant-numeric:tabular-nums;white-space:nowrap}.depot-mission-heading{display:flex;align-items:flex-start;gap:14px}.depot-mission-heading>svg{width:29px;height:29px;margin-top:3px;color:var(--depot-yellow)}.depot-goal{display:flex;justify-content:space-between;align-items:center;gap:14px;margin-top:24px}.depot-goal strong{font-family:Tanker,sans-serif;font-size:56px;font-weight:400;line-height:1;font-variant-numeric:tabular-nums;color:var(--depot-yellow)}.depot-goal strong span{font-size:25px;color:#c3cfad;margin-left:5px}.depot-goal>span{font-size:11px;text-align:right;line-height:1.6;max-width:145px}.depot-gauge{height:8px;background:#41543c;margin:14px 0 22px;overflow:hidden}.depot-gauge>span{display:block;width:100%;height:100%;background:var(--depot-yellow);transform-origin:left;transition:transform .3s ease-out}.depot-effect{border-block:1px solid #566b51;padding:15px 0;margin-bottom:22px}.depot-effect strong{font-family:Tanker,sans-serif;font-size:23px;font-weight:400;color:var(--depot-mint)}.depot-effect p{font-size:12px;margin:7px 0 0}.depot-panel .depot-waiting{color:var(--depot-yellow);font-size:12px}
.depot-scenarios{display:flex;flex-direction:column}.depot-scenarios button{position:relative;display:block;padding:16px 36px 16px 0;text-align:left;background:transparent;border:0;border-bottom:1px solid #566b51;color:var(--depot-sand)}.depot-scenarios button:first-child{padding-top:4px}.depot-scenarios button>strong{display:block;font-family:Tanker,sans-serif;font-size:25px;font-weight:400;color:var(--depot-yellow);line-height:1.1}.depot-scenarios button>span{display:block;margin-top:7px;font-size:12px;line-height:1.5}.depot-scenarios button>svg{position:absolute;right:0;top:calc(50% - 11px)}.depot-scenarios button:hover>strong{color:#fff0b6}.depot-fallback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:18px;text-align:center;padding:60px 28px;background:#37513f;z-index:1}.depot-fallback-mark{font-family:Tanker,sans-serif;font-size:70px;line-height:1;color:var(--depot-yellow)}.depot-fallback h2{font-family:Tanker,sans-serif;font-size:32px;font-weight:400;margin:0}.depot-fallback p{max-width:380px;line-height:1.6;font-size:13px;margin:0}.depot-sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.depot-panel-enter-active,.depot-panel-leave-active{transition:opacity .18s ease-out,transform .24s cubic-bezier(.16,1,.3,1)}.depot-panel-enter-from,.depot-panel-leave-to{opacity:0;transform:translateY(12px)}
.depot-labels :deep(.world-label){position:absolute;display:flex;align-items:center;gap:6px;pointer-events:auto;transform:translate(-50%,-50%);min-height:38px;padding:5px 9px 5px 5px;background:var(--depot-yellow);color:var(--depot-ink);border:1px solid #bf9232;border-radius:3px;box-shadow:0 4px 10px #13251940;white-space:nowrap;cursor:pointer;font-family:'Space Grotesk',sans-serif}.depot-labels :deep(.world-label[hidden]){display:none}.depot-labels :deep(.label-code){display:grid;place-items:center;width:25px;height:25px;background:var(--depot-ink);color:var(--depot-yellow);font-family:Tanker,sans-serif;font-size:20px;line-height:1}.depot-labels :deep(.label-name){font-family:Tanker,sans-serif;font-size:18px;line-height:1.1}.depot-labels :deep(.world-label svg){width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.depot-labels :deep(.world-label[data-status=blocked]){background:#d3d4c1;color:#394d41;border-color:#7c8f7b}.depot-labels :deep(.world-label[data-status=blocked] .label-code){background:#667967;color:#fff4ce}.depot-labels :deep(.world-label[data-status=completed]){background:var(--depot-mint);border-color:#6b8a6e}.depot-labels :deep(.world-label[data-status=completed] .label-code){color:var(--depot-mint)}.depot-labels :deep(.world-label[data-selected=true]){outline:2px solid #fff5d4;outline-offset:3px}.depot-labels :deep(.project-label){background:var(--depot-ink);color:var(--depot-sand);border-color:#a7995b}.depot-labels :deep(.project-label .label-code){background:var(--depot-yellow);color:var(--depot-ink);font-size:25px}.depot-labels :deep(.world-label:focus-visible){outline:3px solid var(--depot-yellow);outline-offset:4px}
@media(min-width:900px){.depot-dock{height:108px;display:flex;align-items:center;gap:30px;padding:18px 26px}.depot-status{flex:1;margin:0}.depot-viewport{bottom:108px}.depot-dock-actions{min-width:310px}.depot-panel{max-height:calc(100% - 144px)}.depot-status h2{font-size:33px}}
.depot-labels :deep(.project-label[data-status=completed]){background:var(--depot-ink);color:var(--depot-sand)}
.depot-labels :deep(.project-label[data-status=completed] .label-code){background:var(--depot-yellow);color:var(--depot-ink)}
@media(max-width:520px){.depot-dock{padding:13px 14px}.depot-status h2{font-size:25px}.depot-status p{font-size:10px}.depot-dock-actions{gap:8px}.depot-dock-actions .depot-action{font-size:11px!important;padding:10px}.depot-project-button{padding:0 10px;font-size:11px!important}.depot-panel{top:auto;bottom:144px;right:10px;width:calc(100% - 20px);max-height:calc(100% - 165px)}.depot-panel-content{padding:20px}.depot-panel h2{font-size:31px}.depot-scene-tools{right:10px;bottom:12px}.depot-demo-strip{left:10px;top:10px;font-size:10px}.depot-simulation{padding:8px 9px}.depot-labels :deep(.world-label){gap:4px;padding:4px 6px 4px 4px;min-height:44px}.depot-labels :deep(.label-name){font-size:16px}.depot-labels :deep(.label-code){width:23px;height:23px}}
@media(prefers-reduced-motion:reduce){.depot-panel-enter-active,.depot-panel-leave-active,.depot-gauge>span{transition:none}}
.depot-labels :deep(.world-label){min-height:44px}
</style>
