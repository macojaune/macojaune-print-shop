<script setup lang="ts">
export type BioLinkEntry = {
  text?: string
  url?: string
  description?: string
  image?: string
  imageAlt?: string
  audio?: string
  action?: string
}
const props = withDefaults(defineProps<{ entry: BioLinkEntry; layout?: 'featured' | 'compact' | 'row'; position?: number }>(), { layout: 'featured', position: 1 })
const hostname = computed(() => {
  try { return new URL(props.entry.url || '').hostname.replace(/^www\./, '') }
  catch { return '' }
})
</script>

<template>
  <article v-if="entry.audio" class="bio-audio-card">
    <img v-if="entry.image" :src="entry.image" :alt="entry.imageAlt || ''" class="audio-artwork">
    <h2>{{ entry.text }}</h2>
    <p v-if="entry.description">{{ entry.description }}</p>
    <audio :src="entry.audio" controls preload="metadata" :aria-label="`Écouter ${entry.text}`" />
    <a v-if="entry.url" :href="entry.url" target="_blank" rel="noopener noreferrer" class="audio-destination">{{ entry.action || 'Ouvrir le lien' }}</a>
  </article>
  <a
    v-else-if="entry.url"
    :href="entry.url"
    :class="['bio-link-card', `bio-link-${layout}`, { 'bio-link-no-image': !entry.image }]"
    target="_blank"
    rel="noopener noreferrer"
    data-umami-event="LinkClick"
    data-umami-section="primary_links"
    :data-umami-label="entry.text"
    :data-umami-position="position"
    data-umami-surface="link_page"
  >
    <div v-if="entry.image" class="link-artwork"><img :src="entry.image" :alt="entry.imageAlt || ''" loading="eager" width="1200" height="630"></div>
    <div class="link-information">
      <span class="link-title">{{ entry.text }}</span>
      <span v-if="entry.description" class="link-description">{{ entry.description }}</span>
      <span v-if="hostname" class="link-host">{{ hostname }}</span>
      <span class="link-action">{{ entry.action || 'Ouvrir le lien' }}</span>
    </div>
  </a>
</template>

<style scoped>
.bio-link-card { display: block; overflow: hidden; background: var(--link-card-bg); color: var(--ink); border-radius: var(--card-radius,16px); box-shadow: var(--card-shadow,0 7px 24px rgb(0 0 0 / 7%)); text-decoration: none; font-weight: 400; transition: box-shadow 260ms, transform 260ms cubic-bezier(.16,1,.3,1); }
.bio-link-card:hover { transform: translateY(-3px); box-shadow: var(--card-hover-shadow,0 12px 28px rgb(0 0 0 / 14%)); color: var(--ink); }
.bio-link-card:active { transform: scale(.985); }
.bio-link-card:focus-visible { outline: 3px solid var(--focus); outline-offset: 5px; }
.link-artwork { overflow: hidden; }
.link-artwork img { display: block; width: 100%; aspect-ratio: 1200 / 630; object-fit: cover; }
.link-information { display: flex; flex-direction: column; align-items: start; padding: 24px; }
.link-title { font-size: 24px; font-weight: 600; line-height: 1.25; letter-spacing: -.025em; }
.link-description { font-size: 14px; line-height: 1.6; margin-top: 10px; color: var(--muted-ink); }
.link-host { font-size: 12px; color: var(--muted-ink); line-height: 1.6; margin-top: 12px; }
.link-action { display: flex; align-items: center; justify-content: center; width: 100%; min-height: 48px; margin-top: 20px; padding: 10px 16px; border-radius: var(--action-radius,10px); background: var(--action-bg); color: var(--action-ink); font-size: 14px; font-weight: 600; line-height: 1.5; }
.bio-link-compact { display: grid; grid-template-columns: 112px 1fr; align-items: stretch; box-shadow: none; border: 1px solid var(--rule); }
.bio-link-compact:hover { border-color: var(--focus); box-shadow: none; }
.bio-link-compact .link-artwork { padding: 12px 0 12px 12px; display: flex; align-items: start; }
.bio-link-compact .link-artwork img { aspect-ratio: 1; object-fit: cover; object-position: 25% center; border-radius: var(--image-radius,8px); }
.bio-link-compact .link-information { padding: 16px; }
.bio-link-compact .link-title { font-size: 20px; }
.bio-link-compact .link-description { margin-top: 8px; font-size: 12px; }
.bio-link-compact .link-host { margin-top: 8px; }
.bio-link-compact .link-action { width: auto; min-height: 44px; margin-top: 12px; padding: 8px 16px; }
.bio-link-row { display: grid; grid-template-columns: 76px 1fr; align-items: center; min-height: 100px; border: 1px solid var(--rule); box-shadow: none; }
.bio-link-row:hover { border-color: var(--focus); box-shadow: none; }
.bio-link-row .link-artwork { padding: 12px 0 12px 12px; }
.bio-link-row .link-artwork img { aspect-ratio: 1; object-fit: cover; border-radius: var(--image-radius,8px); }
.bio-link-row .link-information { padding: 12px 16px; }
.bio-link-row .link-title { font-size: 16px; line-height: 1.35; }
.bio-link-row .link-description { display: none; }
.bio-link-row .link-host { margin-top: 4px; font-size: 11px; }
.bio-link-row .link-action { display: inline; width: auto; min-height: 0; margin-top: 4px; padding: 0; border-radius: 0; background: none; color: var(--ink); font-size: 12px; font-weight: 400; text-decoration: underline; text-underline-offset: 3px; }
.bio-link-no-image { grid-template-columns: 1fr; }
.bio-audio-card { padding: 24px; border-radius: var(--card-radius,16px); background: var(--link-card-bg); color: var(--ink); }
.bio-audio-card h2 { font: inherit; font-size: 22px; line-height: 1.4; font-weight: 600; margin: 0; }
.bio-audio-card p { color: var(--muted-ink); font-size: 14px; line-height: 1.6; }
.audio-artwork { width: 80px; height: 80px; object-fit: cover; border-radius: var(--image-radius,8px); margin-bottom: 16px; }
.bio-audio-card audio { width: 100%; margin-top: 16px; }
.audio-destination { display: inline-flex; min-height: 44px; align-items: center; margin-top: 12px; color: var(--ink); text-decoration: underline; text-underline-offset: 4px; }
@media (max-width: 420px) { .link-information { padding: 20px; } .link-title { font-size: 22px; } .bio-link-compact { grid-template-columns: 96px 1fr; } .bio-link-compact .link-information { padding: 16px; } .bio-link-compact .link-title { font-size: 18px; } }
@media (prefers-reduced-motion: reduce) { .bio-link-card { transition: none; transform: none; } .bio-link-card:hover,.bio-link-card:active { transform: none; } }
</style>
