<script setup>
import { computed, nextTick, ref } from 'vue'
import { devSections, devToolsFlag } from '~/lib/macomisyon/dev-tools.js'

const props = defineProps({ context: { type: String, default: '' } })
const config = useRuntimeConfig()
const enabled = import.meta.dev || devToolsFlag(config.public.macomisyonDevTools)
const open = ref(false)
const toggle = ref(null)
const sections = computed(() => enabled ? devSections() : [])
const last = ref('')

async function run(section, action) {
  await action.run()
  last.value = `${section.title} · ${action.label}`
}
async function close() {
  open.value = false
  await nextTick()
  toggle.value?.focus({ preventScroll: true })
}
function onKeydown(event) {
  if (event.key !== 'Escape') return
  event.stopPropagation()
  void close()
}
</script>

<template>
  <div v-if="enabled" class="maco-dev" @keydown="onKeydown">
    <button ref="toggle" type="button" class="maco-dev-toggle" :aria-expanded="open" aria-controls="maco-dev-panel" @click="open = !open">
      <span aria-hidden="true">⚙</span>Dev
    </button>
    <section v-if="open" id="maco-dev-panel" class="maco-dev-panel" aria-label="Outils de développement">
      <header>
        <div><strong>Simulations · dev</strong><small>{{ props.context }}</small></div>
        <button type="button" aria-label="Fermer les outils de développement" @click="close">×</button>
      </header>
      <p class="maco-dev-warning">Absent en production. Les actions changent seulement la progression locale de ce navigateur.</p>
      <section v-for="section in sections" :key="section.id" class="maco-dev-section" :data-dev-section="section.id" :data-focus="section.focus || undefined">
        <h3>{{ section.title }}<span v-if="section.status">{{ section.status }}</span></h3>
        <p v-if="section.note">{{ section.note }}</p>
        <div class="maco-dev-actions">
          <button v-for="action in section.actions" :key="action.id" type="button" :data-dev-action="section.id + ':' + action.id" :data-tone="action.tone" :disabled="action.disabled" @click="run(section, action)">{{ action.label }}</button>
        </div>
      </section>
      <p class="maco-dev-last" role="status" aria-live="polite">{{ last && 'Fait : ' + last }}</p>
    </section>
  </div>
</template>

<style scoped>
.maco-dev { --dev-ink: #1d0f24; --dev-pink: #ff5fd2; --dev-text: #f7e9f4; position: fixed; top: 10px; right: 12px; z-index: 60; font: 12px/1.45 ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--dev-text); }
.maco-dev * { box-sizing: border-box; }
.maco-dev button { font: inherit; cursor: pointer; }
.maco-dev button:focus-visible { outline: 2px solid var(--dev-pink); outline-offset: 2px; }
.maco-dev-toggle { display: inline-flex; align-items: center; gap: 6px; min-height: 36px; padding: 0 12px; border: 1px dashed var(--dev-pink); border-radius: 999px; background: var(--dev-ink); color: var(--dev-pink); font-weight: 700 !important; }
.maco-dev-toggle[aria-expanded='true'] { background: var(--dev-pink); color: var(--dev-ink); }
.maco-dev-panel { position: absolute; top: 44px; right: 0; width: min(340px, calc(100vw - 24px)); max-height: calc(100dvh - 64px); overflow-y: auto; overscroll-behavior: contain; padding: 0 14px 14px; background: var(--dev-ink); border: 1px dashed var(--dev-pink); border-radius: 6px; box-shadow: 0 16px 40px #0009; }
.maco-dev-panel > header { position: sticky; top: 0; display: flex; align-items: center; justify-content: space-between; gap: 8px; margin: 0 -14px; padding: 10px 6px 10px 14px; background: var(--dev-ink); border-bottom: 1px solid #ff5fd244; }
.maco-dev-panel > header strong { display: block; color: var(--dev-pink); }
.maco-dev-panel > header small { display: block; color: #cdb5c7; }
.maco-dev-panel > header button { width: 36px; height: 36px; border: 0; background: none; color: var(--dev-text); font-size: 20px; }
.maco-dev-warning { margin: 10px 0 4px; color: #cdb5c7; font-size: 11px; }
.maco-dev-section { padding: 10px 0; border-bottom: 1px solid #ff5fd222; }
.maco-dev-section[data-focus] h3 { color: var(--dev-pink); }
.maco-dev-section h3 { display: flex; justify-content: space-between; gap: 8px; margin: 0 0 6px; font-size: 12px; font-weight: 700; }
.maco-dev-section h3 span { color: #cdb5c7; font-weight: 400; font-variant-numeric: tabular-nums; }
.maco-dev-section p { margin: 0 0 8px; color: #cdb5c7; font-size: 11px; }
.maco-dev-actions { display: flex; flex-wrap: wrap; gap: 6px; }
.maco-dev-actions button { min-height: 32px; padding: 4px 9px; border: 1px solid #ff5fd277; border-radius: 4px; background: #2d1838; color: var(--dev-text); text-align: left; }
.maco-dev-actions button:hover:not(:disabled) { background: #46224f; }
.maco-dev-actions button:disabled { opacity: .4; cursor: not-allowed; }
.maco-dev-actions button[data-tone='reset'] { border-style: dashed; color: #ffb3c1; }
.maco-dev-last { min-height: 1.4em; margin: 10px 0 0; color: #9fe3b8; font-size: 11px; }
@media (orientation: landscape) and (max-height: 500px) { .maco-dev { top: 4px; } .maco-dev-panel { top: 40px; max-height: calc(100dvh - 48px); } }
</style>
