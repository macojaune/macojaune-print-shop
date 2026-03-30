<template>
  <div class="bento-v3 min-h-screen">
    <a href="#main-content" class="skip-link">Aller au contenu</a>

    <div class="page-noise" aria-hidden="true">
      <div class="page-glow" />
      <div class="page-grid" />
    </div>

    <header class="masthead">
      <div class="masthead__inner">
        <p class="masthead__tag">Macojaune</p>
        <nav class="masthead__nav" aria-label="Navigation principale">
          <NuxtLink to="/blog">Journal</NuxtLink>
          <NuxtLink to="/projets">Projets</NuxtLink>
          <NuxtLink to="/shop">Tirages</NuxtLink>
          <NuxtLink to="/a-propos">A propos</NuxtLink>
          <NuxtLink to="/link">Liens</NuxtLink>
        </nav>
      </div>
    </header>

    <main id="main-content" class="shell">
      <div class="board auto-rows-[minmax(15rem,_auto)]">
        <section class="tile tile-hero md:col-span-2 lg:col-span-3 lg:row-span-2">
          <div class="hero-copy">
            <p class="eyebrow text-amber-300">Territoire personnel</p>
            <h1 class="hero-title">
              Photographe, developpeur,
              entrepreneur et grand curieux.
            </h1>
            <p class="hero-lead">
              Si tu arrives ici apres m'avoir croise ailleurs, l'idee est simple: comprendre qui je suis,
              ce que je fabrique, ce que j'aime et dans quelles directions mon travail part en ce moment.
            </p>
            <p class="hero-side">
              Ce site melange journal, projets vivants, tirages photo, videos, archives et points
              d'entree utiles. Pas un portfolio sage. Pas une boutique qui crie. Plutot un espace
              noir, jaune et habite.
            </p>
          </div>

          <div class="hero-actions">
            <NuxtLink to="/blog" class="btn-primary">Lire un article</NuxtLink>
            <NuxtLink to="/projets" class="btn-secondary">Voir les projets</NuxtLink>
            <NuxtLink to="/shop" class="btn-secondary">Explorer les tirages</NuxtLink>
          </div>

          <div class="hero-meta">
            <div>
              <p class="hero-meta__label">Ce que tu peux faire ici</p>
              <p class="hero-meta__value">
                lire, fouiller, acheter, suivre, revenir plus tard
              </p>
            </div>
            <div>
              <p class="hero-meta__label">Ambiance voulue</p>
              <p class="hero-meta__value">fun, curiosite, beaute</p>
            </div>
          </div>
        </section>

        <section class="tile tile-note tile-note-chatgpt">
          <p class="eyebrow">Selon internet</p>
          <p class="tile-note__text">
            Macojaune serait un personnage public curieux qui fait de la photo, du web, des projets,
            des experiences et quelques zigzags difficiles a ranger.
          </p>
        </section>

        <section class="tile tile-note tile-note-self lg:row-span-2">
          <p class="eyebrow">Selon moi</p>
          <p class="tile-note__text tile-note__text--dark">
            C'est plutot juste. Le vrai sujet, c'est surtout d'essayer de faire tenir dans un meme
            endroit des idees, des images, des envies de construire et des bouts de parcours qui ne
            rentrent jamais tres bien dans une seule case.
          </p>
          <NuxtLink to="/a-propos" class="inline-entry">
            Continuer par l'histoire
            <span aria-hidden="true">+</span>
          </NuxtLink>
        </section>

        <section class="tile tile-links">
          <div class="tile-heading-row">
            <div>
              <p class="eyebrow text-stone-400">Points d'entree</p>
              <h2 class="section-title text-stone-50">Suivre, ecrire, retrouver</h2>
            </div>
            <NuxtLink to="/link" class="inline-entry inline-entry--light">
              Page complete
              <span aria-hidden="true">+</span>
            </NuxtLink>
          </div>

          <div class="link-grid">
            <a
              v-for="link in quickLinks"
              :key="link.href"
              :href="link.href"
              :target="link.external ? '_blank' : undefined"
              :rel="link.external ? 'noreferrer' : undefined"
              class="link-tile"
            >
              <span class="link-tile__label">{{ link.label }}</span>
              <span class="link-tile__meta">{{ link.meta }}</span>
            </a>
          </div>
        </section>

        <ContentList v-slot="{ list }" :query="featuredArticleQuery" :limit="1">
          <article
            v-for="article in list"
            :key="article.permalink"
            class="group tile tile-feature md:col-span-2 lg:col-span-3"
          >
            <div class="media-shell aspect-[4/3] sm:aspect-[16/10]">
              <img
                v-if="article.image"
                :src="article.image"
                :alt="article.title"
                width="1600"
                height="1000"
                fetchpriority="high"
                class="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
              >
              <div
                v-else
                class="media-fallback"
              >
                Journal
              </div>
              <div class="media-overlay" />
              <div class="media-copy">
                <p class="eyebrow text-amber-300">Dernier billet</p>
                <h2 class="media-title">{{ article.title }}</h2>
                <p class="media-summary">
                  {{ getSummary(article, 185) }}
                </p>
              </div>
            </div>
            <NuxtLink :to="`/blog/${article.permalink}`" class="absolute inset-0 z-10" />
          </article>
        </ContentList>

        <section class="tile tile-heading">
          <p class="eyebrow">Journal</p>
          <h2 class="section-title">Ecrire pour garder des traces</h2>
          <p class="section-copy">
            Des billets, des retours d'experience, des humeurs, des idees et parfois des choses qui
            n'auraient jamais du rester dans les notes.
          </p>
        </section>

        <ContentList v-slot="{ list }" :query="recentArticlesQuery" :limit="3">
          <article
            v-for="(article, index) in list"
            :key="article.permalink"
            :class="['tile tile-article', index === 0 ? 'md:col-span-2 lg:col-span-2' : '']"
          >
            <p class="eyebrow">Article {{ index + 2 }}</p>
            <h3 class="text-xl font-semibold leading-tight text-stone-50 sm:text-2xl">
              {{ article.title }}
            </h3>
            <p class="mt-3 text-sm leading-relaxed text-stone-300 sm:text-base">
              {{ getSummary(article, 145) }}
            </p>
            <NuxtLink :to="`/blog/${article.permalink}`" class="inline-entry mt-6">
              Lire
              <span aria-hidden="true">+</span>
            </NuxtLink>
          </article>
        </ContentList>

        <section class="tile tile-heading tile-heading-projects md:col-span-2">
          <p class="eyebrow">Laboratoire</p>
          <h2 class="section-title">Projets en cours, projets a venir</h2>
          <p class="section-copy">
            La partie la plus vivante du site: des series photo, des chantiers ouverts, des pistes
            a suivre et des envies qui cherchent encore leur bonne forme.
          </p>
        </section>

        <ContentList v-slot="{ list }" :query="projectQuery" :limit="4">
          <article
            v-for="(project, index) in list"
            :key="project.permalink"
            :class="['group tile tile-project', index === 0 ? 'md:col-span-2 lg:col-span-2' : '']"
          >
            <div :class="['media-shell', index === 0 ? 'aspect-[16/10]' : 'aspect-[4/5]']">
              <img
                v-if="project.image"
                :src="project.image"
                :alt="project.title"
                width="1200"
                height="1500"
                loading="lazy"
                class="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
              >
              <div v-else class="media-fallback">
                Projet
              </div>
              <div class="media-overlay" />
              <div class="media-copy media-copy--compact">
                <p class="eyebrow text-stone-300">Projet vivant</p>
                <h3 class="media-title media-title--small">{{ project.title }}</h3>
                <p class="media-summary media-summary--small">
                  {{ getSummary(project, index === 0 ? 170 : 110) }}
                </p>
              </div>
            </div>
            <NuxtLink :to="`/projets/${project.permalink}`" class="absolute inset-0 z-10" />
          </article>
        </ContentList>

        <section class="tile tile-heading tile-heading-shop">
          <p class="eyebrow">Tirages</p>
          <h2 class="section-title">Des series qui peuvent aussi s'accrocher</h2>
          <p class="section-copy">
            Les tirages ne sont pas la pour transformer la home en boutique, mais pour montrer qu'une
            partie du travail peut aussi vivre ailleurs que sur un ecran.
          </p>
        </section>

        <ContentList v-slot="{ list }" :query="runsQuery" :limit="2">
          <article
            v-for="(run, runIndex) in list"
            :key="run._path"
            :class="['tile tile-run', runIndex === 0 ? 'md:col-span-2 lg:col-span-3' : 'md:col-span-2']"
          >
            <div class="tile-heading-row tile-heading-row--start">
              <div class="max-w-2xl">
                <p class="eyebrow">Serie</p>
                <h3 class="text-2xl font-semibold leading-tight text-stone-50 sm:text-3xl">
                  {{ run.title }}
                </h3>
                <p class="mt-3 text-sm leading-relaxed text-stone-300 sm:text-base">
                  {{ run.description }}
                </p>
              </div>
              <NuxtLink :to="`/series/${run.slug}`" class="inline-entry">
                Voir la serie
                <span aria-hidden="true">+</span>
              </NuxtLink>
            </div>

            <div class="product-grid">
              <article
                v-for="(item, itemIndex) in getDisplayItems(run).slice(0, runIndex === 0 ? 4 : 3)"
                :key="`${item.sku || item.displayTitle}-${itemIndex}`"
                :class="['product-card group', runIndex === 0 && itemIndex === 0 ? 'product-card-feature md:col-span-2' : '']"
              >
                <div :class="['product-media', runIndex === 0 && itemIndex === 0 ? 'aspect-[16/10]' : 'aspect-[3/4]']">
                  <img
                    v-if="item.displayImage"
                    :src="item.displayImage"
                    :alt="item.displayTitle"
                    width="900"
                    height="1200"
                    loading="lazy"
                    class="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                  >
                  <div v-else class="media-fallback">
                    {{ item.displayTitle }}
                  </div>
                  <div class="product-overlay" />
                  <div class="product-copy">
                    <p class="product-copy__title">{{ item.displayTitle }}</p>
                    <p class="product-copy__price">{{ item.price || 'Disponible' }}</p>
                  </div>
                </div>
              </article>
            </div>
          </article>
        </ContentList>

        <NuxtLink to="/shop" class="tile tile-cta">
          <p class="eyebrow">Boutique complete</p>
          <h2 class="section-title">Voir tous les tirages</h2>
          <p class="section-copy text-stone-300">
            Si tu veux passer du site au mur, c'est ici que ca se joue.
          </p>
          <span class="btn-secondary btn-secondary--solid mt-6 inline-flex w-fit">Ouvrir la boutique</span>
        </NuxtLink>

        <section class="tile tile-archive">
          <p class="eyebrow">Antecedents</p>
          <h2 class="section-title text-stone-50">Fouiller les traces precedentes</h2>
          <p class="section-copy text-stone-300">
            Il y a des vieux billets, des projets rates, des rebonds, des evolutions de ton et des
            morceaux de trajectoire. Tu peux aussi lire le passe pour comprendre le present.
          </p>
          <div class="archive-links">
            <NuxtLink to="/blog" class="inline-entry">
              Parcourir les articles
              <span aria-hidden="true">+</span>
            </NuxtLink>
            <NuxtLink to="/a-propos" class="inline-entry">
              Lire le parcours
              <span aria-hidden="true">+</span>
            </NuxtLink>
          </div>
        </section>

        <section class="tile tile-video">
          <p class="eyebrow">Video</p>
          <div class="frame-shell">
            <div class="aspect-[9/16] relative">
              <iframe
                src="https://www.youtube.com/embed?list=UULF4b9BIgf07NzGhrdL2zpQ8w"
                title="Dernieres videos Macojaune"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                loading="lazy"
                class="absolute inset-0 h-full w-full"
              />
            </div>
          </div>
          <p class="frame-copy">
            Toujours de la verticalite, mais posee comme une facette parmi les autres plutot qu'un gros bloc a part.
          </p>
        </section>

        <section class="tile tile-podcast md:col-span-2">
          <div class="tile-heading-row tile-heading-row--start">
            <div>
              <p class="eyebrow">Audio</p>
              <h2 class="section-title text-stone-50">Le podcast est encore la</h2>
            </div>
            <a href="https://nalaa.co/podcast-maco-jaune/" target="_blank" rel="noreferrer" class="inline-entry">
              Ecouter
              <span aria-hidden="true">+</span>
            </a>
          </div>
          <p class="section-copy text-stone-300">
            Une autre maniere de suivre les essais, les ratages, les idees et les conversations.
          </p>
          <div class="frame-shell mt-6">
            <iframe
              src="https://pod.link/1369562721"
              title="Podcast Macojaune"
              loading="lazy"
              class="h-[20rem] w-full"
            />
          </div>
        </section>

        <footer class="tile tile-footer md:col-span-2 lg:col-span-3">
          <div>
            <p class="eyebrow">Macojaune.com</p>
            <h2 class="section-title text-stone-50">Un univers a lire, a voir, a suivre, a contacter.</h2>
          </div>
          <div class="footer-links">
            <NuxtLink to="/blog">Blog</NuxtLink>
            <NuxtLink to="/projets">Projets</NuxtLink>
            <NuxtLink to="/shop">Tirages</NuxtLink>
            <NuxtLink to="/a-propos">A propos</NuxtLink>
            <NuxtLink to="/link">Liens</NuxtLink>
            <a href="mailto:hello@macojaune.com">Contact</a>
          </div>
        </footer>
      </div>
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

const quickLinks = [
  { label: 'Instagram', meta: '@macojaune', href: 'https://instagram.com/macojaune', external: true },
  { label: 'YouTube', meta: 'Dernieres videos', href: 'https://www.youtube.com/@macojaune', external: true },
  { label: 'X / Twitter', meta: 'Historique social', href: 'https://twitter.com/macojaune', external: true },
  { label: 'Facebook', meta: 'Ancienne base', href: 'https://facebook.com/macojaune', external: true },
  { label: 'Liens', meta: 'Tous les points d entree', href: '/link', external: false },
  { label: 'Contact', meta: 'hello@macojaune.com', href: 'mailto:hello@macojaune.com', external: true }
]

const featuredArticleQuery: QueryBuilderParams = {
  path: '/blog',
  where: [{ draft: false }],
  sort: [{ date: -1 }]
}

const recentArticlesQuery: QueryBuilderParams = {
  path: '/blog',
  where: [{ draft: false }],
  sort: [{ date: -1 }],
  skip: 1
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
  title: 'Macojaune - Bento V3',
  meta: [
    {
      name: 'description',
      content: "Une homepage sombre et editoriale pour Macojaune: journal, projets, tirages, archives, videos et points d'entree dans un meme territoire."
    },
    {
      name: 'theme-color',
      content: '#0a0a0a'
    }
  ],
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Syne:wght@500;700;800&display=swap'
    }
  ]
})
</script>

<style scoped>
.bento-v3 {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(251, 191, 36, 0.14), transparent 28%),
    radial-gradient(circle at bottom right, rgba(251, 191, 36, 0.1), transparent 24%),
    linear-gradient(180deg, #060606 0%, #0c0c0c 48%, #090909 100%);
  color: rgb(245 245 244);
  font-family: 'IBM Plex Sans', sans-serif;
  color-scheme: dark;
  touch-action: manipulation;
}

.page-noise,
.page-glow,
.page-grid {
  position: absolute;
  inset: 0;
}

.page-noise {
  pointer-events: none;
  opacity: 0.9;
}

.page-glow {
  background:
    radial-gradient(circle at 15% 10%, rgba(251, 191, 36, 0.12), transparent 0 22%),
    radial-gradient(circle at 85% 16%, rgba(245, 158, 11, 0.08), transparent 0 16%);
}

.page-grid {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
  background-size: 34px 34px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 1));
}

.skip-link {
  position: absolute;
  left: 1rem;
  top: 1rem;
  z-index: 60;
  transform: translateY(-150%);
  border: 1px solid rgba(251, 191, 36, 0.45);
  border-radius: 999px;
  background: rgb(17 17 17);
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

.masthead {
  position: sticky;
  top: 0;
  z-index: 40;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(10, 10, 10, 0.84);
  backdrop-filter: blur(12px);
}

.masthead__inner,
.shell {
  position: relative;
  z-index: 1;
}

.masthead__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  max-width: 1600px;
  margin: 0 auto;
  padding: 1rem 1rem;
}

.masthead__tag {
  margin: 0;
  font-family: 'Syne', sans-serif;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgb(251 191 36);
}

.masthead__nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 1rem;
}

.masthead__nav a {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgb(214 211 209);
  transition: color 180ms ease;
}

.masthead__nav a:hover {
  color: rgb(251 191 36);
}

.shell {
  max-width: 1600px;
  margin: 0 auto;
  padding: 1rem;
}

.board {
  display: grid;
  grid-auto-flow: dense;
  grid-template-columns: repeat(auto-fit, minmax(18.5rem, 1fr));
  gap: 1rem;
}

.tile {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 1.5rem;
  background: linear-gradient(180deg, rgba(18, 18, 18, 0.95), rgba(10, 10, 10, 0.94));
  padding: 1.35rem;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.tile::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.025), transparent 24%);
}

.tile:focus-within {
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 0 0 3px rgba(251, 191, 36, 0.32);
}

.tile-hero {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.75rem;
  min-height: 33rem;
  background:
    radial-gradient(circle at top right, rgba(251, 191, 36, 0.22), transparent 24%),
    radial-gradient(circle at bottom left, rgba(251, 191, 36, 0.09), transparent 24%),
    linear-gradient(145deg, rgba(12, 12, 12, 0.98), rgba(19, 19, 19, 0.98));
  border-color: rgba(251, 191, 36, 0.2);
}

.hero-copy {
  display: grid;
  gap: 1rem;
  max-width: 68rem;
}

.hero-title,
.section-title,
.media-title {
  font-family: 'Syne', sans-serif;
  text-wrap: balance;
}

.hero-title {
  max-width: 13ch;
  margin: 0;
  font-size: clamp(3rem, 7vw, 6.8rem);
  line-height: 0.92;
  text-transform: uppercase;
  letter-spacing: -0.05em;
  color: rgb(250 245 236);
}

.hero-lead {
  max-width: 48rem;
  margin: 0;
  font-size: clamp(1.05rem, 1.6vw, 1.35rem);
  line-height: 1.65;
  color: rgb(231 229 228);
}

.hero-side {
  max-width: 38rem;
  margin: 0;
  font-size: 0.98rem;
  line-height: 1.75;
  color: rgb(168 162 158);
}

.hero-actions,
.hero-meta,
.tile-heading-row,
.archive-links,
.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.hero-meta {
  gap: 1.25rem;
}

.hero-meta > div {
  min-width: 15rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.03);
  padding: 0.95rem 1rem;
}

.hero-meta__label {
  margin: 0 0 0.45rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgb(251 191 36);
}

.hero-meta__value {
  margin: 0;
  line-height: 1.55;
  color: rgb(245 245 244);
}

.tile-note {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tile-note-chatgpt {
  background: linear-gradient(180deg, rgba(34, 30, 20, 0.98), rgba(18, 18, 18, 0.98));
  border-color: rgba(251, 191, 36, 0.14);
}

.tile-note-self {
  background: linear-gradient(180deg, rgba(251, 191, 36, 0.95), rgba(232, 171, 18, 0.96));
  color: rgb(15 15 15);
}

.tile-note__text {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.8;
  color: rgb(245 245 244);
}

.tile-note__text--dark {
  color: rgb(17 17 17);
}

.tile-links,
.tile-heading,
.tile-article,
.tile-run,
.tile-podcast,
.tile-footer {
  background: linear-gradient(180deg, rgba(18, 18, 18, 0.98), rgba(11, 11, 11, 0.96));
}

.tile-heading-projects,
.tile-archive,
.tile-cta {
  background: linear-gradient(180deg, rgba(21, 17, 8, 0.98), rgba(11, 11, 11, 0.96));
  border-color: rgba(251, 191, 36, 0.12);
}

.tile-heading-shop {
  background: linear-gradient(180deg, rgba(18, 18, 18, 0.98), rgba(12, 12, 12, 0.98));
}

.tile-feature,
.tile-project,
.tile-video {
  padding: 0;
}

.tile-heading-row {
  align-items: flex-start;
  justify-content: space-between;
}

.tile-heading-row--start {
  align-items: start;
}

.section-title {
  margin: 0.35rem 0 0;
  font-size: clamp(1.75rem, 2vw, 2.5rem);
  line-height: 0.98;
  text-transform: uppercase;
  color: rgb(250 245 236);
}

.section-copy {
  margin: 0.9rem 0 0;
  max-width: 34rem;
  line-height: 1.7;
  color: rgb(161 161 170);
}

.eyebrow {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: rgb(251 191 36);
}

.link-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
}

.link-tile {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-height: 7.5rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1.15rem;
  background: rgba(255, 255, 255, 0.03);
  padding: 1rem;
  transition: transform 180ms ease, border-color 180ms ease, background-color 180ms ease;
}

.link-tile:hover {
  transform: translateY(-2px);
  border-color: rgba(251, 191, 36, 0.55);
  background: rgba(251, 191, 36, 0.09);
}

.link-tile__label {
  font-family: 'Syne', sans-serif;
  font-size: 1.05rem;
  text-transform: uppercase;
  color: rgb(250 245 236);
}

.link-tile__meta {
  font-size: 0.86rem;
  line-height: 1.55;
  color: rgb(168 162 158);
}

.inline-entry,
.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  border-radius: 999px;
  padding: 0.9rem 1.15rem;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  transition:
    transform 180ms ease,
    background-color 180ms ease,
    color 180ms ease,
    border-color 180ms ease;
}

.inline-entry {
  padding-inline: 0;
  border-radius: 0;
  color: rgb(251 191 36);
}

.inline-entry:hover {
  transform: translateX(2px);
}

.inline-entry--light {
  color: rgb(245 245 244);
}

.btn-primary {
  background: rgb(251 191 36);
  color: rgb(17 17 17);
}

.btn-secondary {
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: rgb(250 245 236);
}

.btn-secondary--solid {
  background: rgba(255, 255, 255, 0.1);
}

.btn-primary:hover,
.btn-secondary:hover {
  transform: translateY(-1px);
}

.btn-secondary:hover {
  border-color: rgba(251, 191, 36, 0.36);
  background: rgba(251, 191, 36, 0.12);
}

.media-shell,
.product-media,
.frame-shell {
  position: relative;
  overflow: hidden;
  border-radius: 1.5rem;
}

.media-overlay,
.product-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.02), rgba(0, 0, 0, 0.7));
}

.media-copy,
.product-copy {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  z-index: 1;
  padding: 1.25rem;
}

.media-copy--compact {
  padding: 1rem;
}

.media-title {
  margin: 0.45rem 0 0;
  font-size: clamp(1.75rem, 3vw, 3rem);
  line-height: 0.96;
  color: rgb(250 245 236);
}

.media-title--small {
  font-size: clamp(1.2rem, 2vw, 2rem);
}

.media-summary {
  max-width: 40rem;
  margin: 0.8rem 0 0;
  line-height: 1.7;
  color: rgb(231 229 228);
}

.media-summary--small {
  max-width: 24rem;
  font-size: 0.92rem;
}

.media-fallback {
  display: flex;
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at center, rgba(251, 191, 36, 0.24), transparent 34%),
    linear-gradient(180deg, rgb(28 28 28), rgb(11 11 11));
  font-family: 'Syne', sans-serif;
  font-size: 2rem;
  text-transform: uppercase;
  color: rgb(251 191 36);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(9.5rem, 1fr));
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.product-card {
  overflow: hidden;
  border-radius: 1.2rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgb(10 10 10);
}

.product-card-feature {
  grid-column: span 1;
}

.product-copy__title,
.product-copy__price,
.frame-copy {
  margin: 0;
}

.product-copy__title {
  font-size: 0.88rem;
  font-weight: 700;
  line-height: 1.5;
  color: rgb(250 245 236);
}

.product-copy__price {
  margin-top: 0.45rem;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgb(251 191 36);
}

.frame-shell {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgb(8 8 8);
}

.frame-copy {
  margin-top: 0.9rem;
  line-height: 1.7;
  color: rgb(168 162 158);
}

.archive-links,
.footer-links {
  margin-top: 1.25rem;
}

.footer-links a {
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgb(214 211 209);
  transition: color 180ms ease;
}

.footer-links a:hover,
.masthead__nav a:hover {
  color: rgb(251 191 36);
}

.link-tile:focus-visible,
.btn-primary:focus-visible,
.btn-secondary:focus-visible,
.inline-entry:focus-visible,
.masthead__nav a:focus-visible,
.footer-links a:focus-visible,
a:focus-visible {
  outline: 3px solid rgba(251, 191, 36, 0.75);
  outline-offset: 3px;
}

@media (min-width: 768px) {
  .shell {
    padding: 1.25rem 1.5rem 1.5rem;
  }

  .masthead__inner {
    padding: 1rem 1.5rem;
  }

  .board {
    grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
  }

  .product-card-feature {
    grid-column: span 2;
  }
}

@media (min-width: 1280px) {
  .shell {
    padding: 1.5rem 2rem 2rem;
  }

  .masthead__inner {
    padding-inline: 2rem;
  }

  .board {
    grid-template-columns: repeat(auto-fit, minmax(15.5rem, 1fr));
  }
}

@media (max-width: 767px) {
  .masthead__inner,
  .tile-heading-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .masthead__nav {
    justify-content: flex-start;
  }

  .hero-meta > div {
    width: 100%;
  }
}
</style>
