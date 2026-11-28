<script setup>
import { computed, nextTick, ref } from 'vue'
import GameIcon from './GameIcon.vue'
import { missions } from '../../lib/macomisyon/scolo/model.js'

const props = defineProps({ state: { type: Object, required: true }, paused: Boolean })
const emit = defineEmits(['contribute'])
const scene = ref(null)
const panel = ref(null)
const current = ref(null)
const heading = ref(null)
const inventory = ref(null)
const ready = ref(false)
const unavailable = ref(false)
const nextMission = computed(() => missions[props.state.completed.length])
const situation = computed(() => [
  'Le camion attend devant la maison. Tout le salon reste à emballer.',
  'La vaisselle est emballée. Il reste les cartons de la cuisine.',
  'Le camion est chargé. Un dernier passage sous la galerie.',
  'Le camion est parti. La maison est vide.',
][props.state.completed.length])
const rooms = { sandale: 'Le salon', coutelas: 'La cuisine', digrain: 'La galerie' }
const descriptions = {
  sandale: 'Des scolos sur le dos, une sandale par terre et toute la vaisselle à emballer. Première Komisyon du déménagement.',
  coutelas: 'Le coutelas est resté sur la table. Le camion attend les cartons de la cuisine.',
  digrain: 'La bombe de Digrain est encore sous la galerie. Dernier carton, dernier tour de clé.',
}
let trigger
function status(id) {
  if (props.state.completed.includes(id)) return 'completed'
  return nextMission.value?.id === id ? 'open' : 'blocked'
}
async function open(name, id) {
  if (!panel.value) trigger = document.activeElement
  current.value = missions.find(m => m.id === id) || null
  panel.value = name
  await nextTick()
  heading.value?.focus({ preventScroll: true })
}
async function close() {
  current.value = null
  panel.value = null
  await nextTick()
  const target = trigger?.isConnected && trigger !== document.body ? trigger : inventory.value
  target?.focus({ preventScroll: true })
}
function finish() {
  if (!current.value || status(current.value.id) !== 'open') return
  emit('contribute', current.value.id)
  close()
}
function escape(event) {
  if (panel.value) {
    event.stopPropagation()
    close()
  }
}
</script>

<template>
  <section class="depot-q scolo-house" :data-completed="state.completed.length" :data-moved="state.moved" aria-label="La maison aux cartons" @keydown.esc="escape">
    <div class="depot-viewport">
      <MacomisyonScoloDiorama
ref="scene" :completed="state.completed" :selected="current?.id" :paused="paused"
        @select="id => open('mission', id)" @ready="ready = true; unavailable = false" @error="unavailable = true" />
      <div v-if="unavailable" class="depot-fallback" role="status">
        <GameIcon name="home" /><p>La vue 3D est indisponible. Ouvre les Komisyon pour préparer le déménagement.</p>
      </div>
      <div v-else-if="!ready" class="depot-fallback" role="status"><p>On ouvre les volets…</p></div>
      <div v-if="ready && !unavailable && !panel" class="depot-scene-tools">
        <button type="button" aria-label="Zoomer dans la maison" @click="scene?.zoomBy(1.22)"><GameIcon name="plus" /></button>
        <button type="button" aria-label="Dézoomer dans la maison" @click="scene?.zoomBy(1 / 1.22)"><GameIcon name="minus" /></button>
        <button type="button" aria-label="Recentrer la maison" @click="scene?.resetView()"><GameIcon name="locate" /></button>
      </div>
      <div class="depot-demo-strip"><span class="depot-simulation">Démo locale</span></div>
    </div>

    <footer class="depot-dock">
      <div class="depot-status" aria-live="polite">
        <div><h2>{{ state.moved ? 'On a déménagé !' : 'Le dernier carton' }}</h2><p>{{ situation }}</p></div>
        <span class="depot-repair-count" :aria-label="state.completed.length + ' Komisyon accomplies sur 3'"><b>{{ state.completed.length }}</b><span>/ 3</span></span>
      </div>
      <div class="depot-dock-actions">
        <button id="scolo-missions" ref="inventory" type="button" class="depot-action" @click="open('inventory')"><GameIcon name="parcel" />Les Komisyon<GameIcon name="arrow" /></button>
        <button type="button" class="depot-project-button" @click="open('project')"><GameIcon name="arcade" />Le projet</button>
      </div>
    </footer>

    <section v-if="panel" class="depot-panel" aria-labelledby="scolo-panel-title">
      <header class="depot-panel-bar">
        <span>{{ panel === 'inventory' ? 'Carnet de Komisyon' : panel === 'project' ? 'Fiche projet' : 'Komisyon · Étape ' + current.stage }}</span>
        <button type="button" aria-label="Fermer le panneau" @click="close"><GameIcon name="close" /></button>
      </header>
      <div class="depot-panel-content">
        <template v-if="panel === 'inventory'">
          <h2 id="scolo-panel-title" ref="heading" tabindex="-1">Préparer le déménagement</h2>
          <div class="depot-inventory">
            <button v-for="m in missions" :key="m.id" type="button" :data-state="status(m.id)" :data-mission="m.id" @click="open('mission', m.id)">
              <GameIcon :name="status(m.id) === 'completed' ? 'check' : status(m.id) === 'blocked' ? 'lock' : 'arcade'" />
              <span class="depot-inventory-copy"><strong>{{ m.stage }} · {{ m.label }}</strong><small>{{ rooms[m.id] }} · {{ status(m.id) === 'completed' ? 'Accomplie' : status(m.id) === 'blocked' ? 'En attente' : 'À accomplir' }}</small></span>
            </button>
          </div>
        </template>
        <template v-else-if="panel === 'mission' && current">
          <h2 id="scolo-panel-title" ref="heading" tabindex="-1">{{ current.label }}</h2>
          <p>{{ descriptions[current.id] }}</p>
          <div class="depot-goal"><strong>{{ status(current.id) === 'completed' ? '1' : '0' }}<span>/ 1</span></strong><span>partie terminée simulée</span></div>
          <div class="depot-effect"><strong>Dans la maison</strong><p>{{ current.effect }}</p></div>
          <button v-if="status(current.id) === 'open'" type="button" class="depot-action" @click="finish">Simuler une partie terminée<GameIcon name="check" /></button>
          <p v-else class="depot-waiting">{{ status(current.id) === 'completed' ? 'Komisyon accomplie.' : 'Termine d’abord la Komisyon ' + missions[current.stage - 2].label + '.' }}</p>
          <button type="button" class="depot-text-button" @click="open('inventory')">Toutes les Komisyon</button>
        </template>
        <template v-else>
          <h2 id="scolo-panel-title" ref="heading" tabindex="-1">Scolo · BÈT a milpat</h2>
          <p>Sur Scolo, la dernière rencontre avec un scolopendre détermine le jeu disponible. Dans cette maison, tu peux simuler une partie de chaque mini-jeu pour voir le déménagement.</p>
          <a class="depot-action" href="https://scolo.marvinl.com/#run" target="_blank" rel="noopener noreferrer">Jouer sur Scolo<GameIcon name="external" /></a>
          <a v-for="id in ['sandale', 'coutelas']" :key="id" class="depot-text-button" :href="'https://scolo.marvinl.com/?classement=' + id" target="_blank" rel="noopener noreferrer">Classement {{ id === 'sandale' ? 'Sandale' : 'Coutelas' }} ↗</a>
          <p class="depot-note">Digrain est à venir sur le site public. Les parties simulées ici sont sauvegardées sur cet appareil. Elles ne donnent aucun score sur Scolo.</p>
        </template>
      </div>
    </section>
  </section>
</template>

<style scoped src="~/assets/css/macomisyon-interior.css" />
<style scoped>
.scolo-house { min-height: 0; background: #d6dfc7; }
.depot-simulation { border: 0; }
@media (min-width: 700px) {
  .scolo-house .depot-panel { width: min(350px, 38%); }
}
@media (max-width: 699px) and (orientation: portrait) {
  .scolo-house .depot-panel { top: auto; bottom: 138px; right: 8px; width: calc(100% - 16px); max-height: min(330px, calc((100% - 138px) * .58)); }
}
@media (orientation: landscape) and (max-height: 500px) {
  .depot-viewport { bottom: 64px; }
  .depot-dock { height: 64px; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 5px 12px; }
  .depot-status { margin: 0; flex: 1; }
  .depot-status h2 { font-size: 20px; }
  .depot-status p { font-size: 10px; }
  .depot-panel { inset: 4px 4px 68px auto; width: min(330px, 48%); max-height: none; }
}
</style>
