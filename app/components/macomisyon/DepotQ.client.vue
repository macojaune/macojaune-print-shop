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

<style scoped src="~/assets/css/macomisyon-interior.css" />
