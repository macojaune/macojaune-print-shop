<script setup>
import { computed, nextTick, ref } from 'vue'
import GameIcon from './GameIcon.vue'
import { weapons } from '../../lib/macomisyon/scolo/model.js'

const props = defineProps({ state: { type: Object, required: true }, paused: Boolean })
const scene = ref(null)
const panel = ref(null)
const current = ref(null)
const heading = ref(null)
const inventory = ref(null)
const ready = ref(false)
const unavailable = ref(false)
// « Trop de scolos », acte I: each validated weapon pushes the scolos into another room.
const situation = computed(() => [
  'Les scolos ont pris la maison. Trois armes à essayer.',
  'Une pièce de libérée. Les scolos se sont repliés ailleurs.',
  'Plus qu’une pièce. Les cartons s’empilent.',
  'Ça suffit : tout est emballé, le camion attend.',
][props.state.completed.length])
const upcoming = {
  sandale: 'Les scolos ont pris le canapé. Aucune sandale en vue.',
  coutelas: 'Le coutelas attend dans son emballage. Les scolos traînent sur le plan de travail.',
  digrain: 'La bombe de Digrain dort dans son carton. Les scolos se promènent sur la galerie.',
}
const done = {
  sandale: 'La sandale est accrochée au mur comme un trophée. Le salon est libre… pour l’instant.',
  coutelas: 'Le coutelas est planté au mur, au centre de la cible. La cuisine respire.',
  digrain: 'Un nuage de Digrain flotte encore sur la galerie. Plus un scolo à l’horizon.',
}
const status = id => props.state.completed.includes(id) ? 'completed' : 'upcoming'
let trigger
async function open(name, id) {
  if (!panel.value) trigger = document.activeElement
  current.value = weapons.find(weapon => weapon.id === id) || null
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
function escape(event) {
  if (panel.value) {
    event.stopPropagation()
    close()
  }
}
</script>

<template>
  <section class="depot-q scolo-house" :data-completed="state.completed.length" :data-ready="state.ready" aria-label="La maison aux cartons" @keydown.esc="escape">
    <div class="depot-viewport">
      <MacomisyonScoloDiorama
ref="scene" :completed="state.completed" :selected="current?.id" :paused="paused"
        @select="id => open('mission', id)" @ready="ready = true; unavailable = false" @error="unavailable = true" />
      <div v-if="unavailable" class="depot-fallback" role="status">
        <GameIcon name="home" /><p>La vue 3D est indisponible. Ouvre les Komisyon pour suivre les trois armes.</p>
      </div>
      <div v-else-if="!ready" class="depot-fallback" role="status"><p>On ouvre les volets…</p></div>
      <div v-if="ready && !unavailable && !panel" class="depot-scene-tools">
        <button type="button" aria-label="Zoomer dans la maison" @click="scene?.zoomBy(1.22)"><GameIcon name="plus" /></button>
        <button type="button" aria-label="Dézoomer dans la maison" @click="scene?.zoomBy(1 / 1.22)"><GameIcon name="minus" /></button>
        <button type="button" aria-label="Recentrer la maison" @click="scene?.resetView()"><GameIcon name="locate" /></button>
      </div>
    </div>

    <footer class="depot-dock">
      <div class="depot-status" aria-live="polite">
        <div><h2>{{ state.ready ? 'Ça suffit !' : 'Trop de scolos' }}</h2><p>{{ situation }}</p></div>
        <span class="depot-repair-count" :aria-label="state.completed.length + ' Komisyon accomplies sur 3'"><b>{{ state.completed.length }}</b><span>/ 3</span></span>
      </div>
      <div class="depot-dock-actions">
        <button id="scolo-missions" ref="inventory" type="button" class="depot-action" @click="open('inventory')"><GameIcon name="parcel" />Les Komisyon<GameIcon name="arrow" /></button>
        <button type="button" class="depot-project-button" @click="open('project')"><GameIcon name="arcade" />Le projet</button>
      </div>
    </footer>

    <section v-if="panel" class="depot-panel" aria-labelledby="scolo-panel-title">
      <header class="depot-panel-bar">
        <span>{{ panel === 'inventory' ? 'Carnet de Komisyon' : panel === 'project' ? 'Fiche projet' : 'Komisyon · ' + current.room }}</span>
        <button type="button" aria-label="Fermer le panneau" @click="close"><GameIcon name="close" /></button>
      </header>
      <div class="depot-panel-content">
        <template v-if="panel === 'inventory'">
          <h2 id="scolo-panel-title" ref="heading" tabindex="-1">Chasser les scolos</h2>
          <p>Chaque arme est validée par une vraie rencontre. L’arme utilisée décide du prochain mini-jeu.</p>
          <div class="depot-inventory">
            <button v-for="weapon in weapons" :key="weapon.id" type="button" :data-state="status(weapon.id)" :data-mission="weapon.id" @click="open('mission', weapon.id)">
              <GameIcon :name="status(weapon.id) === 'completed' ? 'check' : 'lock'" />
              <span class="depot-inventory-copy"><strong>{{ weapon.label }}</strong><small>{{ weapon.room }} · {{ status(weapon.id) === 'completed' ? 'Utilisée contre un scolo' : 'À venir' }}</small></span>
            </button>
          </div>
        </template>
        <template v-else-if="panel === 'mission' && current">
          <h2 id="scolo-panel-title" ref="heading" tabindex="-1">{{ current.label }}</h2>
          <p>{{ status(current.id) === 'completed' ? done[current.id] : upcoming[current.id] }}</p>
          <p class="depot-waiting">{{ status(current.id) === 'completed' ? 'Utilisée contre un scolo : son mini-jeu est sorti.' : 'À venir : la prochaine élimination ' + current.with + ' sortira son mini-jeu.' }}</p>
          <a v-if="status(current.id) === 'completed'" class="depot-action" href="https://scolo.marvinl.com/#run" target="_blank" rel="noopener noreferrer">Jouer sur Scolo<GameIcon name="external" /></a>
          <button type="button" class="depot-text-button" @click="open('inventory')">Toutes les Komisyon</button>
        </template>
        <template v-else>
          <h2 id="scolo-panel-title" ref="heading" tabindex="-1">Scolo · BÈT a milpat</h2>
          <p>Sur Scolo, la dernière rencontre avec un scolopendre détermine le jeu disponible : l’arme utilisée pour l’éliminer devient le mini-jeu. Ici, chaque arme utilisée libère une pièce… et les scolos se replient ailleurs.</p>
          <a class="depot-action" href="https://scolo.marvinl.com/#run" target="_blank" rel="noopener noreferrer">Jouer sur Scolo<GameIcon name="external" /></a>
          <a v-for="id in ['sandale', 'coutelas']" :key="id" class="depot-text-button" :href="'https://scolo.marvinl.com/?classement=' + id" target="_blank" rel="noopener noreferrer">Classement {{ id === 'sandale' ? 'Sandale' : 'Coutelas' }} ↗</a>
          <p class="depot-note">Digrain est à venir sur le site public.</p>
        </template>
      </div>
    </section>
  </section>
</template>

<style scoped src="~/assets/css/macomisyon-interior.css" />
<style scoped>
.scolo-house { min-height: 0; background: #d6dfc7; }
@media (min-width: 700px) {
  .scolo-house .depot-panel { width: min(350px, 38%); }
}
@media (max-width: 699px) and (orientation: portrait) {
  .scolo-house .depot-panel { top: auto; bottom: 138px; right: 8px; width: calc(100% - 16px); max-height: min(330px, calc((100% - 138px) * .58)); }
}
</style>
