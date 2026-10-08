<script setup lang="ts">
import BioLinkCard from './BioLinkCard.vue'
import type { BioLinkEntry } from './BioLinkCard.vue'

type GalleryEntry = { title: string; to: string; image: string; meta: string }
type ProjectEntry = { title: string; to: string; image: string; meta: string; description: string; tags: string[] }
const props = defineProps<{ links: BioLinkEntry[]; gallery: GalleryEntry[]; projects: ProjectEntry[]; about: string }>()
const socialLinks = [
  { label: 'Instagram', href: 'https://instagram.com/macojaune' },
  { label: 'Twitter', href: 'https://twitter.com/macojaune' },
]
const sharedLinks = computed(() => props.links.map(entry => {
  let isPersonalSite = false
  try { isPersonalSite = new URL(entry.url || '').hostname.replace(/^www\./, '') === 'marvinl.com' }
  catch { /* Entries without a valid URL do not get a website preview. */ }
  return isPersonalSite ? {
    ...entry,
    image: entry.image || '/link-preview/marvinl-site.png',
    imageAlt: entry.imageAlt || 'Aperçu de MarvinL.com',
    description: entry.description || 'Produits, expériences et idées en construction.',
    action: entry.action || 'Découvrir mon site',
  } : entry
}))
</script>

<template>
    <main class="bio-page">
      <div class="bio-column">
        <header class="bio-profile">
          <h1>Macojaune</h1>
          <p class="bio-handle">@macojaune</p>
          <p class="bio-intro">Les liens que je partage, au même endroit.</p>
        </header>

        <section class="shared-links" aria-label="Les liens que je partage">
          <BioLinkCard v-for="(entry, index) in sharedLinks" :key="entry.url || index" :entry="entry" :layout="index === 0 ? 'featured' : 'row'" :position="index + 1" />
        </section>

        <nav class="bio-socials" aria-label="Mes réseaux sociaux"><a v-for="social in socialLinks" :key="social.href" :href="social.href" target="_blank" rel="noopener noreferrer" data-umami-event="LinkHubClick" data-umami-section="social_links" :data-umami-label="social.label" data-umami-surface="link_page">{{ social.label }}</a></nav>

        <div class="bio-more">
          <h2>Un peu plus de moi</h2>
          <section class="bio-gallery" aria-labelledby="photos-heading">
            <div class="section-heading"><h3 id="photos-heading">Mes photos</h3><NuxtLink to="/galerie" class="text-action">Voir la galerie</NuxtLink></div>
            <div class="gallery-grid"><NuxtLink v-for="entry in gallery" :key="entry.to" :to="entry.to" class="gallery-link" data-umami-event="LinkHubClick" data-umami-section="gallery_highlights" :data-umami-label="entry.title" data-umami-surface="link_page"><RunImage v-if="entry.image" :src="entry.image" :alt="entry.title" variant="card" sizes="(min-width: 650px) 260px, 45vw" loading="lazy" /><span class="gallery-title">{{ entry.title }}</span><span class="gallery-action">Voir la série</span></NuxtLink></div>
          </section>

          <section class="bio-projects" aria-labelledby="projects-heading">
            <div class="section-heading"><h3 id="projects-heading">Viens créer avec moi</h3><NuxtLink to="/projets" class="text-action">Tous les projets</NuxtLink></div>
            <NuxtLink v-for="project in projects" :key="project.to" :to="project.to" class="project-link" data-umami-event="LinkHubClick" data-umami-section="project_highlights" :data-umami-label="project.title" data-umami-surface="link_page"><div class="project-heading"><h4>{{ project.title }}</h4><span v-if="project.meta">{{ project.meta }}</span></div><p>{{ project.description }}</p><span class="text-action">Voir le projet</span></NuxtLink>
          </section>

          <section class="bio-about" aria-labelledby="about-heading"><h3 id="about-heading">À propos</h3><p>{{ about }}</p><NuxtLink to="/a-propos" class="text-action">En savoir plus sur moi</NuxtLink></section>
        </div>
        <footer class="bio-footer"><NuxtLink to="/blog">Lire le blog</NuxtLink><NuxtLink to="/">Visiter macojaune.com</NuxtLink></footer>
      </div>
    </main>
</template>

<style scoped>
.bio-page { --bg: transparent; --ink: #ffffff; --muted-ink: #d6d3d1; --link-card-bg: #0c0a09; --action-bg: #fbbf24; --action-ink: #000000; --focus: #fcd34d; --rule: rgb(255 255 255 / 16%); --card-radius: 0px; --image-radius: 0px; --action-radius: 0px; --card-shadow: none; --card-hover-shadow: none; background: var(--bg); color: var(--ink); min-height: 100vh; padding: 32px 24px 24px; font-family: 'Space Grotesk',sans-serif; }
.bio-column { width: 100%; max-width: 560px; margin: auto; }
.bio-page :is(h1,h2,h3,h4,p) { margin: 0; color: inherit; font-weight: 400; letter-spacing: normal; line-height: inherit; }
.bio-page :is(a,button) { font-weight: 400; text-decoration: none; color: inherit; box-shadow: none; }
.bio-page :is(a,button):focus-visible { outline: 3px solid var(--focus); outline-offset: 4px; }
.bio-profile { text-align: center; padding: 0 0 28px; }
.bio-profile h1 { font-family: 'Tanker',sans-serif; font-size: 42px; line-height: 1; text-transform: uppercase; }
.bio-handle { font-size: 12px; margin-top: 8px !important; color: var(--muted-ink) !important; }
.bio-intro { font-size: 14px; margin-top: 12px !important; line-height: 1.6 !important; }
.shared-links { display: flex; flex-direction: column; gap: 16px; }
.bio-socials { display: flex; justify-content: center; gap: 10px; padding: 20px 0 32px; }
.bio-socials a { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; padding: 10px 20px; font-size: 13px; border: 1px solid var(--rule); border-radius: 0; transition: background-color 200ms; }
.bio-socials a:hover { background: var(--link-card-bg); }
.bio-more { border-top: 1px solid var(--rule); padding-top: 28px; }
.bio-more > h2 { font-size: 22px; font-weight: 500; line-height: 1.4; }
.bio-more > section { margin-top: 28px; }
.section-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
.section-heading h3,.bio-about h3 { font-size: 16px; line-height: 1.5; font-weight: 500; }
.bio-page .text-action { display: inline-flex; min-height: 44px; align-items: center; font-size: 12px; text-decoration: underline; text-underline-offset: 4px; text-decoration-thickness: 1px; }
.gallery-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 20px 14px; }
.gallery-link { display: block; overflow: hidden; }
.gallery-link :deep(img) { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 0; }
.gallery-title { display: block; font-size: 12px; line-height: 1.5; margin-top: 8px; }
.gallery-action { display: inline-flex; align-items: center; min-height: 44px; font-size: 11px; color: var(--muted-ink); text-decoration: underline; text-underline-offset: 4px; }
.project-link { display: block; border-top: 1px solid var(--rule); padding: 20px 0 12px; }
.project-heading { display: flex; align-items: center; gap: 16px; }
.project-heading h4 { font-family: 'Tanker',sans-serif; font-size: 24px; line-height: 1.1; }
.project-heading > span { font-size: 11px; color: var(--muted-ink); }
.project-link p,.bio-about p { font-size: 13px; line-height: 1.8 !important; margin-top: 10px; color: var(--muted-ink); }
.bio-about { border-top: 1px solid var(--rule); padding-top: 24px; }
.bio-footer { border-top: 1px solid var(--rule); display: flex; justify-content: center; flex-wrap: wrap; gap: 12px 24px; padding: 24px 0 0; margin-top: 24px; }
.bio-footer a { display: inline-flex; align-items: center; min-height: 44px; font-size: 11px; color: var(--muted-ink); text-decoration: underline; text-underline-offset: 4px; }
.bio-page .bio-profile h1,.bio-page .bio-more :is(h2,h3,h4) { color: #fbbf24; }
.bio-page :deep(.bio-link-featured) { border: 1px solid var(--rule); }
.bio-page :deep(.bio-link-featured:hover) { border-color: rgb(255 255 255 / 32%); }
.bio-page :deep(.bio-link-featured .link-title) { font-family: 'Tanker',sans-serif; font-size: 30px; font-weight: 400; letter-spacing: normal; text-transform: uppercase; color: #fbbf24; }
.bio-page :deep(.bio-link-featured .link-action) { font-size: 12px; letter-spacing: .16em; text-transform: uppercase; }
.bio-page :deep(.bio-link-row .link-action) { color: #fde68a; }
.bio-page :deep(.bio-link-row:hover) { border-color: rgb(255 255 255 / 32%); }
.bio-page .bio-socials a { border-radius: 0; color: #fde68a; }
.bio-page .gallery-link :deep(img) { border-radius: 0; }
.bio-page :is(.text-action,.gallery-action,.bio-footer a) { color: #fde68a; }
.bio-page ::selection { color: #000000; background: #fbbf24; }
@media (max-width: 600px) { .bio-page { padding: 24px 16px 20px; } .bio-profile { padding-bottom: 24px; } .bio-profile h1 { font-size: 36px; } .bio-intro { font-size: 12px; } .bio-socials { padding: 16px 0 24px; } .bio-more { padding-top: 24px; } .section-heading { gap: 8px; } .section-heading h3 { font-size: 15px; } .gallery-grid { gap: 16px 12px; } .bio-more > section { margin-top: 24px; } }
@media (prefers-reduced-motion: reduce) { .bio-page * { transition: none !important; } }
</style>
