<script setup lang="ts">
const rooms = [
  {
    gameId: 1, room: 'Le salon', game: 'Sandale',
    story: 'Une sandale au milieu du carrelage. Tout autour, des scolos sur le dos. On enjambe le tas pour récupérer le carton de vaisselle.',
    play: 'Dans le mini-jeu Sandale, tiens aussi longtemps que possible face aux scolos.',
    records: 'https://scolo.marvinl.com/?classement=sandale',
  },
  {
    gameId: 3, room: 'La cuisine', game: 'Coutelas',
    story: 'Le coutelas de tonton est resté sur la table. Sous l’évier, ça gratte encore. On laisse le buffet au prochain locataire.',
    play: 'Le mini-jeu Coutelas se joue en ajustant l’angle et la puissance du lancer.',
    records: 'https://scolo.marvinl.com/?classement=coutelas',
  },
  {
    gameId: 2, room: 'La galerie', game: 'Digrain',
    story: 'Une bombe de Digrain vide roule entre deux cartons. On entend le camion klaxonner. Les clés de la nouvelle maison sont au crochet.',
    play: 'Digrain, le troisième mini-jeu, arrive plus tard sur le site public.',
  },
]
const selected = ref(0)
const moved = ref(false)
const activeRoom = computed(() => rooms[selected.value]!)
function explore(index: number) {
  selected.value = index
  moved.value = false
}
</script>

<template>
  <section id="house-story" class="house" aria-labelledby="house-title" tabindex="-1">
    <div class="house-art">
      <img src="/macomisyon/dernier-carton.webp" width="1120" height="747" alt="Dans la maison aux volets turquoise, une sandale et des scolopendres retournés jonchent le carrelage. Des cartons attendent près de la porte ouverte." />
    </div>
    <div class="house-story">
      <p class="house-project">Scolo · BÈT a milpat</p>
      <h2 id="house-title">Le dernier carton</h2>
      <nav aria-label="Pièces de la maison">
        <button v-for="(room, index) in rooms" :key="room.gameId" type="button" :aria-pressed="selected === index" @click="explore(index)">{{ room.room }}</button>
      </nav>
      <div class="house-room" aria-live="polite">
        <template v-if="!moved">
          <h3>{{ activeRoom.game }}</h3>
          <p>{{ activeRoom.story }}</p>
          <p class="house-game">{{ activeRoom.play }}</p>
          <a v-if="activeRoom.records" :href="activeRoom.records" target="_blank" rel="noopener noreferrer">Classement {{ activeRoom.game }} ↗</a>
          <button v-if="selected === rooms.length - 1" class="keys" type="button" @click="moved = true">Prendre les clés</button>
        </template>
        <template v-else>
          <h3>On déménage !</h3>
          <p>Le dernier carton monte dans le camion. À la nouvelle maison, on pose la vaisselle, on ouvre les volets… et on garde la sandale à portée de main.</p>
        </template>
      </div>
      <div class="house-exit">
        <a href="https://scolo.marvinl.com/#run" target="_blank" rel="noopener noreferrer">Jouer sur Scolo ↗</a>
        <small>Le jeu proposé dépend de l’arme de la dernière rencontre.</small>
      </div>
    </div>
  </section>
</template>

<style scoped>
.house { height: 100%; overflow: auto; overscroll-behavior: contain; display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(300px, 1fr); background: #f1ebd3; color: #173b3c; }
.house-art { position: relative; min-height: 100%; background: #34554b; }
.house-art img { position: absolute; width: 100%; height: 100%; object-fit: cover; }
.house-story { margin: auto 0; padding: clamp(20px, 4vw, 60px); }
.house-project { margin: 0; font-size: 13px; font-weight: 700; letter-spacing: .05em; }
.house h2, .house h3 { font-family: Tanker, sans-serif; font-weight: 400; }
.house h2 { font-size: clamp(40px, 5vw, 72px); line-height: .98; margin: 8px 0 24px; }
.house nav { display: flex; flex-wrap: wrap; gap: 4px; }
.house nav button { color: inherit; background: transparent; border: 1px solid #768d77; padding: 8px 12px; min-height: 44px; font-size: 13px; }
.house nav button[aria-pressed=true] { background: #173b3c; color: #fff7d8; }
.house-room { margin: 22px 0; }
.house h3 { margin: 0 0 8px; font-size: 32px; line-height: 1; }
.house-room p { font-size: 16px; line-height: 1.5; margin: 0 0 10px; }
.house-room .house-game, .house-exit small { font-size: 13px; }
.house-room a, .keys { display: inline-flex; align-items: center; min-height: 44px; color: inherit; font-weight: 700; text-decoration: underline; }
.keys { border: 0; background: #ffcf43; padding: 8px 16px; }
.house-exit { display: grid; justify-items: start; gap: 6px; border-top: 1px solid #9ba89a; padding-top: 16px; }
.house-exit a { display: inline-flex; align-items: center; min-height: 44px; padding: 8px 18px; background: #173b3c; color: #fff7d8; font-weight: 700; text-decoration: none; }
.house :is(button, a):focus-visible { outline: 3px solid #a34523; outline-offset: 2px; }
@media (max-width: 760px) {
  .house { display: block; }
  .house-art { min-height: 0; aspect-ratio: 2.1; }
  .house-art img { object-position: center 64%; }
  .house-story { padding: 18px; }
  .house h2 { margin-bottom: 14px; }
  .house-room { margin: 16px 0; }
}
</style>
