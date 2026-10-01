<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import GameIcon from './GameIcon.vue'
import { BANK_GOALS } from '../../lib/macomisyon/bank/model.js'

const props = defineProps({ paused: { type: Boolean, default: false }, state: { type: Object, required: true } })
const emit = defineEmits(['action'])
const surface = ref(null)
const markers = ref([])
const panel = ref(null)
const selected = ref(null)
const panelHeading = ref(null)
const inventoryButton = ref(null)
const loading = ref(true)
const error = ref(false)
const announcement = ref('')
let world = null
let alive = true
let selectionRequest = 0
let previousFocus = null
const steps = [
  { id: 'newsletter', number: 1, icon: 'mail', short: 'Le guichet déborde', title: 'Submerger le guichet', goal: BANK_GOALS.newsletter, unit: 'inscriptions newsletter', description: 'Le tube pneumatique livre les inscriptions au premier employé. Plus le courrier arrive, moins il regarde ailleurs.', effect: 'Les enveloppes s’empilent sur le comptoir, tombent au sol et attirent une file d’attente. Après l’objectif, la pile continue de monter.', action: 'Simuler une inscription newsletter' },
  { id: 'applications', number: 2, icon: 'file', short: 'Les dossiers s’emballent', title: 'Occuper le deuxième bureau', goal: BANK_GOALS.applications, unit: 'formulaires reçus', description: 'Chaque candidature rejoint le bureau du deuxième employé. Il tamponne. Il classe. Il perd de vue le coffre.', effect: 'Le tampon s’active, les dossiers envahissent le bureau et débordent après le quota. Reçu ne veut jamais dire admis.', action: 'Simuler un formulaire reçu' },
  { id: 'beta', number: 3, icon: 'tape', short: 'Le coffre VHS', title: 'Ouvrir les archives', goal: 1, unit: 'ouverture explicite', description: 'Pendant que les deux bureaux font diversion, la porte révèle le vrai trésor : des cassettes vidéo, rien que des cassettes.', effect: 'Le coffre pivote, le tapis se déroule et une VHS sort des archives. Les deux employés restent occupés à leur bureau.' },
]
const scenarios = [
  { id: 'discovered', title: 'Hall ouvert, guichets vides', text: 'Trois postes à découvrir, la diversion commence.' },
  { id: 'ready', title: 'Objectifs atteints, coffre fermé', text: 'Les deux bureaux sont occupés. La bêta attend sa décision.' },
  { id: 'beta', title: 'Coffre VHS ouvert', text: 'Les archives sont accessibles. Aucun autre trésor.' },
  { id: 'beyond', title: 'Objectifs dépassés', text: '32 courriers, 20 dossiers : les piles débordent et le coffre passe inaperçu.' },
  { id: 'new', title: 'Réinitialiser la banque et revenir au monde', text: 'Remet uniquement cette banque à zéro, sans modifier le hangar.' },
]
const current = computed(() => steps.find(step => step.id === selected.value))
const countFor = step => step.id === 'beta' ? Number(props.state.betaOpen) : props.state.counts[step.id]
const statusFor = step => countFor(step) >= step.goal ? 'completed' : step.id === 'beta' && !props.state.counts.admitted ? 'blocked' : 'active'
const completedCount = computed(() => steps.filter(step => statusFor(step) === 'completed').length)
const currentCount = computed(() => current.value ? countFor(current.value) : 0)
const excess = computed(() => current.value ? Math.max(0, currentCount.value - current.value.goal) : 0)
const canQualify = computed(() => props.state.counts.qualified < props.state.counts.applications)
const canInvite = computed(() => props.state.counts.admitted < props.state.counts.qualified)
const situation = computed(() => {
  const { newsletter, applications } = props.state.counts
  if (props.state.betaOpen) return newsletter > BANK_GOALS.newsletter || applications > BANK_GOALS.applications ? 'Les bureaux débordent. Le coffre passe inaperçu.' : 'Les VHS sont accessibles. Les employés restent à leur bureau.'
  if (!newsletter && !applications) return 'Trois étapes pour détourner l’attention.'
  return newsletter + ' courriers · ' + applications + ' dossiers. La diversion prend forme.'
})
const sceneDescription = computed(() => props.state.betaOpen
  ? 'Le coffre est ouvert : rayonnages, piles et cassette sur le tapis ne contiennent que des VHS. Deux employés font face à leurs bureaux, occupés par les piles.'
  : 'Une grande banque en coupe. Étape 1 à gauche : courrier et file d’attente. Étape 2 au deuxième bureau : dossiers reçus. Étape 3 au fond : coffre à VHS fermé.')
const stepFor = id => steps.find(step => step.id === id)
const markerLabel = id => { const step = stepFor(id); return step ? 'Étape ' + step.number + ' — ' + step.short + ', ' + countFor(step) + ' sur ' + step.goal : '' }

async function openPanel(name) {
  selectionRequest++
  previousFocus = document.activeElement
  panel.value = name
  await nextTick()
  if (alive) panelHeading.value?.focus({ preventScroll: true })
}
function closePanel() {
  selectionRequest++
  panel.value = null
  selected.value = null
  nextTick(() => {
    if (!alive) return
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
    else inventoryButton.value?.focus({ preventScroll: true })
  })
}
async function choose(id) {
  const request = ++selectionRequest
  previousFocus = document.activeElement
  selected.value = id
  panel.value = null
  if (world && !error.value && id !== 'project') await world.focusStation(id)
  if (!alive || request !== selectionRequest) return
  panel.value = id === 'project' ? 'project' : 'mission'
  await nextTick()
  if (alive) panelHeading.value?.focus({ preventScroll: true })
}
function act(action, id, amount = 1) {
  for (let index = 0; index < amount; index++) emit('action', action, id)
  if (action === 'qualify') announcement.value = 'Candidature qualifiée dans la démo, sans invitation automatique.'
  else if (action === 'invite') announcement.value = 'Invitation simulée. Aucun message réel n’est envoyé.'
  else if (id) announcement.value = 'Progression simulée. Les compteurs et les piles continuent après l’objectif.'
}
function applyScenario(id) {
  closePanel()
  world?.resetView()
  emit('action', 'scenario', id)
  announcement.value = 'État de démonstration remplacé. Aucun compteur réel ne change.'
}
function onKeydown(event) {
  if (event.key === 'Escape' && (panel.value || selected.value)) { event.stopPropagation(); closePanel() }
}
function onViewportKey(event) {
  if (event.target !== event.currentTarget) return
  const offsets = { ArrowLeft: [35, 0], ArrowRight: [-35, 0], ArrowUp: [0, 35], ArrowDown: [0, -35] }
  if (offsets[event.key]) { event.preventDefault(); world?.panBy(...offsets[event.key]) }
  else if (['+', '=', '-'].includes(event.key)) { event.preventDefault(); world?.zoomBy(event.key === '-' ? 1 / 1.22 : 1.22) }
}
watch(() => props.paused, value => world?.setPaused(value))
watch(() => props.state, (next, previous) => {
  world?.setState(next)
  if (next.betaOpen && !previous?.betaOpen) {
    selectionRequest++
    panel.value = null
    selected.value = null
    world?.resetView()
    announcement.value = 'Le coffre s’ouvre. Aucun lingot : uniquement des VHS. Les bureaux continuent leur diversion.'
    nextTick(() => { if (alive) inventoryButton.value?.focus({ preventScroll: true }) })
  } else if (next.completed.includes('applications') && !previous?.completed.includes('applications')) announcement.value = 'Étape 2 accomplie. Les dossiers continuent de s’accumuler, sans admission automatique.'
  else if (next.completed.includes('newsletter') && !previous?.completed.includes('newsletter')) announcement.value = 'Étape 1 accomplie. Le guichet déborde : tu peux continuer à alimenter la diversion.'
})
onMounted(async () => {
  try {
    const { createBankWorld } = await import('../../lib/macomisyon/bank/world.js')
    if (!alive || !surface.value) return
    world = createBankWorld(surface.value, {
      onReady: () => { error.value = false }, onError: () => { error.value = true },
      onLabels: values => { if (alive) markers.value = values },
    })
    world.setPaused(props.paused)
    world.setState(props.state, { animate: false })
  } catch { world?.dispose(); world = null; error.value = true }
  finally { if (alive) loading.value = false }
})
onBeforeUnmount(() => { alive = false; selectionRequest++; world?.dispose(); world = null })
defineExpose({ getDebug: () => ({ ...world?.getDebug(), panel: panel.value, selected: selected.value }), getState: () => props.state })
</script>

<template>
  <div class="depot-q meme-bank" :class="{ 'has-panel': panel }" :data-world-error="error" :data-beta-open="state.betaOpen" @keydown="onKeydown">
    <div class="depot-viewport bank-viewport" tabindex="0" role="group" aria-label="Vue de la banque, trois étapes à explorer" aria-describedby="bank-navigation" @keydown="onViewportKey">
      <div ref="surface" class="bank-surface" />
      <div v-show="!error && panel !== 'mission'" class="depot-labels bank-labels">
        <template v-for="marker in markers" :key="marker.id">
          <button v-if="stepFor(marker.id) && marker.visible" type="button" class="world-label" :data-step="stepFor(marker.id).number" :data-status="statusFor(stepFor(marker.id))" :data-selected="selected === marker.id" :style="{ left: marker.x + 'px', top: marker.y + 'px' }" :aria-label="markerLabel(marker.id)" @click="choose(marker.id)">
            <span class="label-code">{{ stepFor(marker.id).number }}</span><span class="label-name">Étape {{ stepFor(marker.id).number }}</span><GameIcon :name="statusFor(stepFor(marker.id)) === 'completed' ? 'check' : stepFor(marker.id).icon" :size="17" />
          </button>
        </template>
      </div>
      <div v-if="loading" class="depot-fallback" role="status"><p>Ouverture des guichets…</p></div>
      <div v-else-if="error" class="depot-fallback" role="status"><GameIcon name="tape" :size="48" /><h2>La banque reste ouverte.</h2><p>La vue 3D est indisponible. Les trois étapes et toutes les simulations restent accessibles dans les Komisyon.</p><button type="button" class="depot-action" @click="openPanel('inventory')">Voir les trois étapes</button></div>
      <div class="depot-scene-tools">
        <button type="button" aria-label="Zoomer dans la banque" :disabled="error || loading" @click="world?.zoomBy(1.22)"><GameIcon name="plus" /></button>
        <button type="button" aria-label="Dézoomer dans la banque" :disabled="error || loading" @click="world?.zoomBy(1 / 1.22)"><GameIcon name="minus" /></button>
        <button type="button" aria-label="Recentrer la banque" :disabled="error || loading" @click="world?.resetView()"><GameIcon name="locate" /></button>
      </div>
      <div class="depot-demo-strip"><span class="depot-simulation">Démo locale</span><button type="button" aria-label="Choisir un scénario de démonstration de la banque" @click="openPanel('demo')">Changer d’état<GameIcon name="arrow" /></button></div>
      <p id="bank-navigation" class="depot-sr-only">Flèches : déplacer la vue. Plus et moins : zoomer. Sélectionne une étape numérotée ou ouvre les Komisyon.</p>
      <p class="depot-sr-only">{{ sceneDescription }}</p>
    </div>

    <footer class="depot-dock">
      <div class="depot-status"><div><h2>Memebank sous pression</h2><p>{{ situation }}</p></div><span class="depot-repair-count" :aria-label="completedCount + ' étapes accomplies sur 3'"><b>{{ completedCount }}</b><span>/ 3</span></span></div>
      <div class="depot-dock-actions"><button id="bank-missions" ref="inventoryButton" type="button" class="depot-action" @click="openPanel('inventory')"><GameIcon name="tape" />Les Komisyon<GameIcon name="arrow" /></button><button type="button" class="depot-project-button" @click="choose('project')"><GameIcon name="bank" />Le projet</button></div>
    </footer>

    <Transition name="depot-panel">
      <section v-if="panel" class="depot-panel" aria-labelledby="bank-panel-title">
        <header class="depot-panel-bar"><span>{{ panel === 'demo' ? 'Console de démo' : panel === 'inventory' ? 'Carnet de Komisyon' : panel === 'project' ? 'Fiche projet' : 'Komisyon · Étape ' + current?.number }}</span><button type="button" aria-label="Fermer le panneau" @click="closePanel"><GameIcon name="close" /></button></header>
        <div class="depot-panel-content">
          <template v-if="panel === 'project'">
            <h2 id="bank-panel-title" ref="panelHeading" tabindex="-1">Memebank</h2><p class="depot-lead">La banque des mèmes.</p><p>Une institution beaucoup trop sérieuse pour ce qu’elle protège. Dans le coffre : des VHS, uniquement des VHS.</p>
            <div class="depot-project-story"><GameIcon name="tape" :size="50" /><p>Le casse, c’est la diversion : on submerge les deux bureaux pendant que les archives deviennent accessibles. Les employés ont bien trop à classer pour regarder le coffre.</p></div>
            <button type="button" class="depot-action" @click="openPanel('inventory')">Voir les trois étapes<GameIcon name="arrow" /></button><p class="depot-note">Le hall s’est ouvert après {{ state.counts.curiosity }} visites simulées. Les deux bureaux progressent en parallèle. La bêta reste une décision distincte.</p>
          </template>
          <template v-else-if="panel === 'inventory'">
            <h2 id="bank-panel-title" ref="panelHeading" tabindex="-1">Organiser la diversion</h2><p>Choisis une étape pour la retrouver dans la banque et voir ce qui s’y accumule.</p>
            <div class="depot-inventory bank-inventory"><button v-for="step in steps" :key="step.id" type="button" :data-state="statusFor(step)" :data-mission="step.id" @click="choose(step.id)"><GameIcon :name="statusFor(step) === 'completed' ? 'check' : step.icon" /><span class="depot-inventory-copy"><strong>Étape {{ step.number }} · {{ step.short }}</strong><small>{{ step.id === 'beta' ? state.betaOpen ? 'Archives accessibles' : 'Ouverture explicite après sélection' : countFor(step) > step.goal ? 'Objectif dépassé · la pile continue' : statusFor(step) === 'completed' ? 'Accomplie · on peut continuer' : 'Mission principale' }}</small></span><span class="depot-inventory-count">{{ countFor(step) }}/{{ step.goal }}</span></button></div>
            <p class="depot-note">Quotas illustratifs : 8 inscriptions, 5 formulaires. Étapes 1 et 2 indépendantes. Aucun plafond de contribution à l’objectif ; l’ouverture du coffre ne sélectionne pas des candidats automatiquement.</p>
          </template>
          <template v-else-if="panel === 'mission' && current">
            <div class="depot-mission-heading"><GameIcon :name="current.icon" /><h2 id="bank-panel-title" ref="panelHeading" tabindex="-1">{{ current.title }}</h2></div><p>{{ current.description }}</p>
            <div class="depot-goal"><strong>{{ currentCount }}<span>/ {{ current.goal }}</span></strong><span>{{ current.unit }}<br>{{ excess ? 'objectif dépassé de ' + excess : currentCount >= current.goal ? 'objectif atteint' : 'objectif de démonstration' }}</span></div>
            <div class="depot-gauge" role="progressbar" :aria-label="'Progression : ' + current.unit" :aria-valuenow="Math.min(currentCount, current.goal)" :aria-valuemin="0" :aria-valuemax="current.goal" :aria-valuetext="currentCount + ' sur ' + current.goal + (excess ? ', ' + excess + ' au-delà de l’objectif' : '')"><span :style="{ transform: 'scaleX(' + Math.min(currentCount / current.goal, 1) + ')' }" /></div>
            <p v-if="excess" class="bank-over-goal">+{{ excess }} au-delà du quota. Le bureau ne redescend pas : continue, il déborde encore.</p>
            <div class="depot-effect"><strong>Dans la banque</strong><p>{{ current.effect }}</p></div>
            <template v-if="current.id !== 'beta'"><button type="button" class="depot-action" @click="act('contribute', current.id)"><GameIcon name="plus" />{{ current.action }}</button><button type="button" class="depot-text-button" :aria-label="'Simuler cinq contributions pour l’étape ' + current.number" @click="act('contribute', current.id, 5)">Simuler +5 pour voir le débordement</button></template>
            <template v-else>
              <dl class="bank-admissions"><div><dt>Formulaires reçus</dt><dd>{{ state.counts.applications }}</dd></div><div><dt>Candidatures qualifiées</dt><dd>{{ state.counts.qualified }}</dd></div><div><dt>Invitations simulées</dt><dd>{{ state.counts.admitted }}</dd></div></dl>
              <div class="bank-selection-actions"><button type="button" :disabled="!canQualify" aria-label="Simuler une candidature qualifiée" @click="act('qualify')">Qualifier +1</button><button type="button" :disabled="!canInvite" aria-label="Simuler une invitation bêta" @click="act('invite')">Inviter +1</button></div>
              <p class="depot-note bank-beta-rule">Formulaire reçu ≠ candidature retenue. Qualifie un dossier, puis simule une invitation pour essayer l’ouverture.</p>
              <button type="button" class="depot-action bank-open" :class="{ 'is-complete': state.betaOpen }" :disabled="state.betaOpen || !state.counts.admitted" @click="act('openBeta')"><GameIcon :name="state.betaOpen ? 'check' : 'lock'" />{{ state.betaOpen ? 'Bêta ouverte · simulation' : 'Simuler l’ouverture bêta' }}</button>
            </template>
            <button type="button" class="depot-text-button" @click="openPanel('inventory')">Toutes les Komisyon</button><p class="depot-note">Simulation sauvegardée sur cet appareil. Aucun email, compte, accès réel ou Zikak n’est créé. Les quantités continuent au-delà des quotas ; le dessin des piles compresse les très grands nombres.</p>
          </template>
          <template v-else-if="panel === 'demo'">
            <h2 id="bank-panel-title" ref="panelHeading" tabindex="-1">Essaie la diversion</h2><p>Chaque scénario remplace la progression locale de cette banque. Compare les bureaux vides, les objectifs atteints et le chaos après dépassement.</p>
            <div class="depot-scenarios bank-scenarios"><button v-for="scenario in scenarios" :key="scenario.id" type="button" @click="applyScenario(scenario.id)"><strong>{{ scenario.title }}</strong><span>{{ scenario.text }}</span><GameIcon name="arrow" /></button></div><p class="depot-note">Ce sont des essais de mise en scène, pas des objectifs de production approuvés.</p>
          </template>
        </div>
      </section>
    </Transition>
    <p class="depot-sr-only" role="status" aria-live="polite">{{ announcement }}</p>
  </div>
</template>

<style scoped src="~/assets/css/macomisyon-interior.css" />
<style scoped>
.meme-bank { background: #d6dfc7; }
.bank-surface { position: absolute; inset: 0; }
.bank-surface :deep(canvas) { display: block; width: 100%; height: 100%; }
.bank-viewport:focus-visible { outline: 3px solid #ffcf43; outline-offset: -5px; }
.bank-labels .world-label { min-height: 44px; }
.bank-labels .world-label > svg { margin-left: 2px; }
.bank-labels .world-label[hidden] { display: none; }
.meme-bank .depot-project-story > svg { width: 48px; height: 48px; color: var(--depot-yellow); }
.meme-bank .bank-over-goal { padding: 12px 14px; background: #344a3a; border-left: 3px solid #ffcf43; color: #f6edce; font-size: 13px; }
.bank-admissions { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin: 18px 0 12px; }
.bank-admissions > div { border-bottom: 1px solid #566b51; padding-bottom: 10px; }
.bank-admissions dt { color: #cad3ba; font-size: 11px; line-height: 1.5; }
.bank-admissions dd { margin: 7px 0 0; font-size: 25px; color: #ffcf43; font-variant-numeric: tabular-nums; }
.bank-selection-actions { display: flex; gap: 10px; }
.bank-selection-actions button { flex: 1; min-height: 44px; padding: 8px; font-size: 12px; border: 1px solid #78917b; color: #f6edce; background: transparent; }
.bank-selection-actions button:hover { background: #3c5345; }
.meme-bank .bank-beta-rule { margin: 16px 0; }
.meme-bank .bank-open.is-complete { opacity: 1; background: #b6d4b8; color: #1a302a; }
.meme-bank.has-panel .depot-scene-tools { right: 426px; }
.meme-bank .depot-goal { flex-wrap: wrap; }
.meme-bank .depot-goal strong { max-width: 100%; overflow-wrap: anywhere; }
.bank-admissions dd { overflow-wrap: anywhere; }
@media (max-width: 699px) {
  .meme-bank .depot-panel { top: auto; bottom: 144px; right: 10px; width: calc(100% - 20px); max-height: min(300px, calc((100% - 132px) * .46)); }
  .meme-bank.has-panel .depot-scene-tools { top: 10px; bottom: auto; right: 10px; flex-direction: row; }
  .meme-bank.has-panel .depot-scene-tools button { border-bottom: 0; border-right: 1px solid #506657; }
  .meme-bank.has-panel .depot-scene-tools button:last-child { border-right: 0; }
  .meme-bank.has-panel .depot-simulation { display: none; }
  .bank-admissions { gap: 8px; }
}
</style>
