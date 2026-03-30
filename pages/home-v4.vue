<template>
  <div class="home-v4">
    <a href="#main-content" class="skip-link">Aller au contenu</a>

    <header class="site-header">
      <div class="site-header__inner">
        <NuxtLink to="/" class="site-id">Macojaune</NuxtLink>
        <nav class="site-nav" aria-label="Navigation principale">
          <NuxtLink to="/blog">Blog</NuxtLink>
          <NuxtLink to="/projets">Projets</NuxtLink>
          <NuxtLink to="/shop">Tirages</NuxtLink>
          <NuxtLink to="/a-propos">A propos</NuxtLink>
          <NuxtLink to="/link">Liens</NuxtLink>
        </nav>
      </div>
    </header>

    <main id="main-content">
      <section class="hero section-shell">
        <div class="hero__copy">
          <p class="kicker">Photographe, developpeur, entrepreneur</p>
          <h1 class="hero__title">
            Un univers noir, jaune,
            curieux et tres vivant.
          </h1>
          <p class="hero__lead">
            Si tu me connais deja de nom, des reseaux ou d'une ancienne phase de travail,
            cette page sert a te montrer ce que je fais maintenant, ce que je garde encore en vie
            et tout ce que tu peux aller explorer ensuite.
          </p>
          <div class="hero__actions">
            <NuxtLink to="/projets" class="button button--primary">Voir les projets</NuxtLink>
            <NuxtLink to="/blog" class="button button--secondary">Lire le journal</NuxtLink>
            <NuxtLink to="/shop" class="button button--secondary">Voir les tirages</NuxtLink>
          </div>
        </div>

        <aside class="hero__aside">
          <p class="eyebrow">Ici, tu peux</p>
          <ul class="hero__list">
            <li>suivre les projets photo en cours</li>
            <li>fouiller les articles et les archives</li>
            <li>retrouver mes liens et me contacter</li>
            <li>acheter des tirages quand une serie te parle</li>
          </ul>
          <div class="hero__signals">
            <span>fun</span>
            <span>curiosite</span>
            <span>beaute</span>
          </div>
        </aside>
      </section>

      <section class="rail section-shell section-shell--tight">
        <div class="rail__track">
          <span>Photo</span>
          <span>Web</span>
          <span>Idees</span>
          <span>Archives</span>
          <span>Tirages</span>
          <span>Video</span>
          <span>Laboratoire</span>
        </div>
      </section>

      <ContentList v-slot="{ list }" :query="featuredArticleQuery" :limit="1">
        <section
          v-for="article in list"
          :key="article.permalink"
          class="story section-shell section-shell--story"
        >
          <div class="section-intro">
            <p class="eyebrow">Dernier billet</p>
            <h2 class="section-title">Le meilleur point d'entree reste souvent un texte.</h2>
            <p class="section-copy">
              Le journal sert a raconter les virages, les obsessions, les essais, les retours
              d'experience et tout ce qui reste entre deux projets.
            </p>
          </div>

          <article class="story-card">
            <div class="story-card__media">
              <img
                v-if="article.image"
                :src="article.image"
                :alt="article.title"
                width="1600"
                height="1000"
                fetchpriority="high"
                class="story-card__image"
              >
              <div v-else class="story-card__fallback">Journal</div>
            </div>
            <div class="story-card__body">
              <p class="story-card__eyebrow">A lire maintenant</p>
              <h3 class="story-card__title">{{ article.title }}</h3>
              <p class="story-card__summary">{{ getSummary(article, 220) }}</p>
              <NuxtLink :to="`/blog/${article.permalink}`" class="inline-link">
                Lire l'article
                <span aria-hidden="true">+</span>
              </NuxtLink>
            </div>
          </article>
        </section>
      </ContentList>

      <section class="section-shell section-shell--contrast">
        <div class="section-intro section-intro--compact">
          <p class="eyebrow">Projets vivants</p>
          <h2 class="section-title">Le coeur du site est ici.</h2>
          <p class="section-copy">
            Des projets en cours, des choses qui se prepareront plus tard, et des pieces qui font
            avancer l'univers general.
          </p>
        </div>

        <ContentList v-slot="{ list }" :query="projectQuery" :limit="4">
          <div class="project-stack">
            <article
              v-for="(project, index) in list"
              :key="project.permalink"
              :class="['project-band', index === 0 ? 'project-band--feature' : '']"
            >
              <div class="project-band__media">
                <img
                  v-if="project.image"
                  :src="project.image"
                  :alt="project.title"
                  width="1200"
                  height="1500"
                  loading="lazy"
                  class="project-band__image"
                >
                <div v-else class="project-band__fallback">Projet</div>
              </div>
              <div class="project-band__copy">
                <p class="project-band__eyebrow">Projet {{ index + 1 }}</p>
                <h3 class="project-band__title">{{ project.title }}</h3>
                <p class="project-band__summary">
                  {{ getSummary(project, index === 0 ? 200 : 130) }}
                </p>
                <NuxtLink :to="`/projets/${project.permalink}`" class="inline-link inline-link--dark">
                  Ouvrir
                  <span aria-hidden="true">+</span>
                </NuxtLink>
              </div>
            </article>
          </div>
        </ContentList>
      </section>

      <section class="section-shell section-shell--split">
        <div class="section-intro">
          <p class="eyebrow">Tirages</p>
          <h2 class="section-title">Des series qui peuvent sortir du site.</h2>
          <p class="section-copy">
            Les tirages ne prennent pas toute la home, mais ils doivent rester visibles parce qu'ils
            font partie du travail et pas juste d'une couche commerciale ajoutee apres coup.
          </p>
          <NuxtLink to="/shop" class="button button--secondary">Ouvrir la boutique</NuxtLink>
        </div>

        <ContentList v-slot="{ list }" :query="runsQuery" :limit="2">
          <div class="print-stack">
            <article v-for="run in list" :key="run._path" class="print-block">
              <div class="print-block__header">
                <div>
                  <p class="print-block__eyebrow">Serie</p>
                  <h3 class="print-block__title">{{ run.title }}</h3>
                </div>
                <NuxtLink :to="`/series/${run.slug}`" class="inline-link">
                  Voir la serie
                  <span aria-hidden="true">+</span>
                </NuxtLink>
              </div>
              <p class="print-block__summary">{{ run.description }}</p>
              <div class="print-grid">
                <article
                  v-for="(item, index) in getDisplayItems(run).slice(0, 3)"
                  :key="`${item.sku || item.displayTitle}-${index}`"
                  class="print-card"
                >
                  <div class="print-card__media">
                    <img
                      v-if="item.displayImage"
                      :src="item.displayImage"
                      :alt="item.displayTitle"
                      width="900"
                      height="1200"
                      loading="lazy"
                      class="print-card__image"
                    >
                    <div v-else class="print-card__fallback">{{ item.displayTitle }}</div>
                  </div>
                  <div class="print-card__body">
                    <p class="print-card__title">{{ item.displayTitle }}</p>
                    <p class="print-card__price">{{ item.price || 'Disponible' }}</p>
                  </div>
                </article>
              </div>
            </article>
          </div>
        </ContentList>
      </section>

      <section class="section-shell section-shell--archive">
        <div class="archive-grid">
          <div class="archive-copy">
            <p class="eyebrow">Antecedents</p>
            <h2 class="section-title">Le passe compte aussi.</h2>
            <p class="section-copy">
              Il y a des vieux articles, des bouts de parcours, des versions precedentes du travail
              et des traces qui permettent de comprendre d'ou viennent certaines obsessions.
            </p>
            <div class="archive-actions">
              <NuxtLink to="/blog" class="inline-link inline-link--dark">
                Parcourir les articles
                <span aria-hidden="true">+</span>
              </NuxtLink>
              <NuxtLink to="/a-propos" class="inline-link inline-link--dark">
                Lire le parcours
                <span aria-hidden="true">+</span>
              </NuxtLink>
            </div>
          </div>

          <div class="contact-panel">
            <p class="eyebrow">Suivre et contacter</p>
            <div class="contact-links">
              <a href="https://instagram.com/macojaune" target="_blank" rel="noreferrer">Instagram</a>
              <a href="https://www.youtube.com/@macojaune" target="_blank" rel="noreferrer">YouTube</a>
              <a href="https://twitter.com/macojaune" target="_blank" rel="noreferrer">X / Twitter</a>
              <a href="mailto:hello@macojaune.com">hello@macojaune.com</a>
              <NuxtLink to="/link">Tous les liens</NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <section class="section-shell section-shell--media">
        <div class="media-columns">
          <article class="media-panel">
            <p class="eyebrow">Video</p>
            <h2 class="media-panel__title">La partie qui bouge.</h2>
            <div class="media-frame media-frame--vertical">
              <iframe
                src="https://www.youtube.com/embed?list=UULF4b9BIgf07NzGhrdL2zpQ8w"
                title="Dernieres videos Macojaune"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                loading="lazy"
                class="media-frame__inner"
              />
            </div>
          </article>

          <article class="media-panel media-panel--podcast">
            <p class="eyebrow">Podcast</p>
            <h2 class="media-panel__title">La partie qui reste en fond.</h2>
            <div class="media-frame">
              <iframe
                src="https://pod.link/1369562721"
                title="Podcast Macojaune"
                loading="lazy"
                class="media-frame__inner"
              />
            </div>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { QueryBuilderParams } from '@nuxt/content/types'

definePageMeta({ layout: false })

interface ContentNode {
  value?: string
  children?: ContentNode[]
}

interface ContentEntry {
  description?: string
  body?: { children?: ContentNode[] } | ContentNode[] | ContentNode | string
}

interface RunProduct {
  sku?: string
  title: string
  price?: string
  images?: string[]
}

interface RunEntry {
  products?: RunProduct[]
  slug?: string
  title: string
  description?: string
}

interface DisplayItem extends RunProduct {
  displayImage: string | null
  displayTitle: string
}

const featuredArticleQuery: QueryBuilderParams = {
  path: '/blog',
  where: [{ draft: false }],
  sort: [{ date: -1 }]
}

const projectQuery: QueryBuilderParams = {
  path: '/projects',
  where: [{ draft: false }],
  sort: [{ date: -1 }]
}

const runsQuery: QueryBuilderParams = {
  path: '/runs',
  sort: [{ date: -1 }]
}

const flattenText = (value: unknown): string => {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.map((item) => flattenText(item)).join(' ')
  if (typeof value === 'object') {
    if ('value' in value && typeof value.value === 'string') return value.value
    if ('children' in value) return flattenText(value.children)
  }
  return ''
}

const cleanText = (value: string, maxLength = 160) => {
  const plain = value
    .replace(/[#>*_`-]+/g, ' ')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()

  if (plain.length <= maxLength) return plain
  return `${plain.slice(0, maxLength).trim()}...`
}

const getSummary = (entry: ContentEntry, maxLength = 160) => {
  const text = entry.description || flattenText(entry.body?.children || entry.body || '')
  if (!text) return 'Une piece du territoire Macojaune, entre image, idees et experimentation.'
  return cleanText(text, maxLength)
}

const getDisplayItems = (run: RunEntry) => {
  const items: DisplayItem[] = []
  if (!run?.products) return items

  run.products.forEach((product) => {
    if (product.images?.length) {
      product.images.forEach((img: string, imgIdx: number) => {
        items.push({
          ...product,
          displayImage: img,
          displayTitle: product.images.length > 1 ? `${product.title} #${imgIdx + 1}` : product.title
        })
      })
      return
    }

    items.push({
      ...product,
      displayImage: null,
      displayTitle: product.title
    })
  })

  return items
}

useHead({
  title: 'Macojaune - Home V4',
  meta: [
    {
      name: 'description',
      content: "Une nouvelle direction pour la homepage Macojaune: plus editoriale, plus structuree, plus tranchee entre projets, journal, tirages, archives et contact."
    },
    {
      name: 'theme-color',
      content: '#090909'
    }
  ],
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Syne:wght@600;700;800&display=swap'
    }
  ]
})
</script>

<style scoped>
.home-v4 {
  background:
    radial-gradient(circle at top left, rgba(251, 191, 36, 0.08), transparent 24%),
    linear-gradient(180deg, #070707 0%, #0a0a0a 46%, #050505 100%);
  color: rgb(245 245 244);
  font-family: 'IBM Plex Sans', sans-serif;
  color-scheme: dark;
}

.skip-link {
  position: absolute;
  left: 1rem;
  top: 1rem;
  z-index: 60;
  transform: translateY(-150%);
  border-radius: 999px;
  background: rgb(20 20 20);
  border: 1px solid rgba(251, 191, 36, 0.35);
  color: rgb(250 245 236);
  padding: 0.75rem 1rem;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  transition: transform 180ms ease;
}

.skip-link:focus-visible {
  transform: translateY(0);
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 40;
  backdrop-filter: blur(12px);
  background: rgba(7, 7, 7, 0.84);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.site-header__inner,
.section-shell {
  width: min(100%, 1480px);
  margin: 0 auto;
}

.site-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
}

.site-id {
  font-family: 'Syne', sans-serif;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgb(251 191 36);
}

.site-nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 1rem;
}

.site-nav a {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgb(214 211 209);
}

.section-shell {
  padding: clamp(1.25rem, 3vw, 2.5rem) 1rem;
}

.section-shell--tight {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(18rem, 0.85fr);
  gap: clamp(1rem, 3vw, 2.25rem);
  align-items: stretch;
  min-height: calc(100vh - 5rem);
  padding-top: clamp(2rem, 6vw, 4.5rem);
  padding-bottom: clamp(2rem, 6vw, 4.5rem);
}

.hero__copy,
.hero__aside,
.story-card,
.project-band,
.print-block,
.archive-grid,
.media-panel {
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.hero__copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.2rem;
  min-height: 34rem;
  padding: clamp(1.6rem, 4vw, 3rem);
  border-radius: 2rem;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent),
    linear-gradient(145deg, rgba(10, 10, 10, 0.98), rgba(16, 16, 16, 0.98));
}

.hero__aside {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.5rem;
  border-radius: 1.5rem;
  background: linear-gradient(180deg, rgba(28, 23, 11, 0.94), rgba(14, 14, 14, 0.96));
}

.kicker,
.eyebrow,
.story-card__eyebrow,
.project-band__eyebrow,
.print-block__eyebrow {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: rgb(251 191 36);
}

.hero__title,
.section-title,
.story-card__title,
.project-band__title,
.print-block__title,
.media-panel__title {
  margin: 0;
  font-family: 'Syne', sans-serif;
  text-wrap: balance;
}

.hero__title {
  max-width: 10ch;
  font-size: clamp(3.4rem, 8vw, 7rem);
  line-height: 0.92;
  letter-spacing: -0.05em;
}

.hero__lead {
  max-width: 46rem;
  margin: 0;
  font-size: clamp(1.05rem, 1.7vw, 1.35rem);
  line-height: 1.7;
  color: rgb(229 229 229);
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 0.95rem 1.25rem;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  transition: transform 180ms ease, background-color 180ms ease, border-color 180ms ease;
}

.button--primary {
  background: rgb(251 191 36);
  color: rgb(10 10 10);
}

.button--secondary {
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.03);
  color: rgb(245 245 244);
}

.button:hover {
  transform: translateY(-1px);
}

.hero__list {
  display: grid;
  gap: 0.9rem;
  margin: 0;
  padding-left: 1.1rem;
  line-height: 1.7;
  color: rgb(231 229 228);
}

.hero__signals {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.hero__signals span {
  border-radius: 999px;
  border: 1px solid rgba(251, 191, 36, 0.24);
  padding: 0.55rem 0.8rem;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgb(251 191 36);
}

.rail__track {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.9rem 0;
}

.rail__track span {
  color: rgb(168 162 158);
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.section-shell--story,
.section-shell--split,
.section-shell--media {
  display: grid;
  gap: clamp(1.25rem, 3vw, 2rem);
  align-items: start;
}

.section-shell--story,
.section-shell--split {
  grid-template-columns: minmax(17rem, 0.72fr) minmax(0, 1.28fr);
}

.section-shell--contrast,
.section-shell--archive {
  background: rgba(255, 255, 255, 0.02);
}

.section-intro {
  display: grid;
  gap: 0.85rem;
  align-content: start;
  max-width: 30rem;
}

.section-intro--compact {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: clamp(2rem, 4vw, 4rem);
  line-height: 0.96;
}

.section-copy {
  margin: 0;
  line-height: 1.75;
  color: rgb(168 162 158);
}

.story-card {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(18rem, 0.95fr);
  overflow: hidden;
  border-radius: 1.8rem;
  background: linear-gradient(180deg, rgba(16, 16, 16, 0.98), rgba(9, 9, 9, 0.98));
}

.story-card__media,
.project-band__media,
.print-card__media,
.media-frame {
  position: relative;
  overflow: hidden;
}

.story-card__media {
  min-height: 30rem;
}

.story-card__image,
.project-band__image,
.print-card__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.story-card__fallback,
.project-band__fallback,
.print-card__fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 16rem;
  background: linear-gradient(145deg, rgba(39, 32, 12, 0.95), rgba(15, 15, 15, 0.98));
  color: rgb(251 191 36);
  font-family: 'Syne', sans-serif;
  font-size: 2rem;
  text-transform: uppercase;
}

.story-card__body {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  padding: clamp(1.5rem, 4vw, 2.5rem);
}

.story-card__title {
  font-size: clamp(1.8rem, 3vw, 3.2rem);
  line-height: 0.98;
}

.story-card__summary,
.project-band__summary,
.print-block__summary {
  margin: 0;
  line-height: 1.75;
  color: rgb(214 211 209);
}

.inline-link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  width: fit-content;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgb(251 191 36);
}

.inline-link--dark {
  color: rgb(12 12 12);
}

.project-stack,
.print-stack,
.archive-grid,
.media-columns {
  display: grid;
  gap: 1rem;
}

.project-band {
  display: grid;
  grid-template-columns: minmax(15rem, 0.88fr) minmax(0, 1.12fr);
  overflow: hidden;
  border-radius: 1.6rem;
  background: linear-gradient(180deg, rgba(248, 191, 29, 0.98), rgba(232, 176, 16, 0.98));
  color: rgb(10 10 10);
}

.project-band--feature {
  grid-template-columns: minmax(18rem, 1.1fr) minmax(0, 0.9fr);
}

.project-band__media {
  min-height: 22rem;
}

.project-band__copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.9rem;
  padding: clamp(1.4rem, 4vw, 2.4rem);
}

.project-band__title,
.print-block__title,
.media-panel__title {
  font-size: clamp(1.5rem, 3vw, 2.8rem);
  line-height: 0.98;
}

.section-shell--split {
  align-items: start;
}

.print-stack {
  align-content: start;
}

.print-block {
  border-radius: 1.6rem;
  background: linear-gradient(180deg, rgba(15, 15, 15, 0.98), rgba(8, 8, 8, 0.98));
  padding: 1.4rem;
}

.print-block__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 1rem;
}

.print-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.8rem;
  margin-top: 1.2rem;
}

.print-card {
  overflow: hidden;
  border-radius: 1.2rem;
  background: rgb(18 18 18);
  border: 1px solid rgba(255, 255, 255, 0.07);
}

.print-card__media {
  aspect-ratio: 3 / 4;
}

.print-card__body {
  display: grid;
  gap: 0.4rem;
  padding: 0.9rem;
}

.print-card__title,
.print-card__price {
  margin: 0;
}

.print-card__title {
  color: rgb(245 245 244);
  font-weight: 700;
}

.print-card__price {
  font-size: 0.8rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgb(251 191 36);
}

.archive-grid {
  grid-template-columns: minmax(0, 1.15fr) minmax(18rem, 0.85fr);
}

.archive-copy,
.contact-panel {
  padding: clamp(1.4rem, 4vw, 2.25rem);
  border-radius: 1.6rem;
}

.archive-copy {
  background: linear-gradient(180deg, rgba(247, 191, 35, 0.98), rgba(228, 171, 18, 0.98));
  color: rgb(10 10 10);
}

.contact-panel {
  background: linear-gradient(180deg, rgba(14, 14, 14, 0.98), rgba(7, 7, 7, 0.98));
}

.archive-actions,
.contact-links {
  display: grid;
  gap: 0.85rem;
  margin-top: 1.5rem;
}

.contact-links a {
  display: block;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  font-weight: 600;
  color: rgb(245 245 244);
}

.media-columns {
  grid-template-columns: minmax(17rem, 0.85fr) minmax(0, 1.15fr);
}

.media-panel {
  padding: 1.4rem;
  border-radius: 1.6rem;
  background: linear-gradient(180deg, rgba(14, 14, 14, 0.98), rgba(8, 8, 8, 0.98));
}

.media-panel--podcast {
  background: linear-gradient(180deg, rgba(28, 23, 11, 0.94), rgba(12, 12, 12, 0.98));
}

.media-frame {
  margin-top: 1.25rem;
  border-radius: 1.2rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgb(5 5 5);
}

.media-frame--vertical {
  aspect-ratio: 9 / 16;
  max-width: 26rem;
}

.media-frame:not(.media-frame--vertical) {
  min-height: 22rem;
}

.media-frame__inner {
  display: block;
  width: 100%;
  height: 100%;
  min-height: inherit;
}

.site-nav a:hover,
.contact-links a:hover,
.inline-link:hover {
  color: rgb(255 214 79);
}

.button:focus-visible,
.site-nav a:focus-visible,
.site-id:focus-visible,
.contact-links a:focus-visible,
.inline-link:focus-visible,
a:focus-visible {
  outline: 3px solid rgba(251, 191, 36, 0.75);
  outline-offset: 3px;
}

@media (max-width: 1180px) {
  .hero,
  .section-shell--story,
  .section-shell--split,
  .archive-grid,
  .media-columns,
  .story-card,
  .project-band,
  .project-band--feature {
    grid-template-columns: 1fr;
  }

  .hero {
    min-height: auto;
  }

  .story-card__media,
  .project-band__media {
    min-height: 20rem;
  }

  .media-frame--vertical {
    max-width: 100%;
  }
}

@media (max-width: 820px) {
  .site-header__inner {
    flex-direction: column;
    align-items: flex-start;
  }

  .site-nav {
    justify-content: flex-start;
  }

  .print-grid {
    grid-template-columns: 1fr;
  }
}
</style>
