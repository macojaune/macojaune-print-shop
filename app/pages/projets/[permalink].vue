<template>
  <div class="w-full px-4 py-3 lg:px-6 lg:py-4">
    <div class="mx-auto max-w-[1500px]">
      <header class="border-b border-amber-200/10 pb-5 lg:pb-6">
        <div class="max-w-[72rem]">
          <NuxtLink
            to="/projets"
            class="inline-flex w-fit items-center py-1.5 text-xs uppercase tracking-[0.28em] text-stone-300 transition hover:text-amber-200"
          >
            Retour aux projets
          </NuxtLink>
          <div class="mt-3 flex items-start gap-3 lg:gap-4">
            <span
              class="rounded-full border border-amber-200/20 bg-amber-300/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.3em] text-amber-100 lg:mt-3"
            >
              Projet:
            </span>
            <h1 class="max-w-[11ch] font-display text-5xl uppercase leading-[0.84] text-amber-400 lg:text-[6.2rem]">
              {{ data?.title ?? "" }}
            </h1>
          </div>
          <div
            v-if="projectMeta.length"
            class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] uppercase tracking-[0.3em] text-amber-300/68"
          >
            <span v-for="item in projectMeta" :key="item">{{ item }}</span>
          </div>
        </div>
      </header>

      <div class="grid gap-8 pt-5 lg:grid-cols-12 lg:gap-10 lg:pt-6">
        <article ref="articleRef" class="project-content lg:col-span-8">
          <div class="project-body">
            <figure
              v-if="projectImages.length"
              class="project-inline-media relative mb-5 overflow-hidden border border-white/10 bg-stone-950 lg:float-right lg:mb-4 lg:ml-10 lg:w-[clamp(21rem,42%,37rem)]"
            >
              <div class="project-image-stage relative aspect-[4/5] w-full overflow-hidden">
                <ProjectImage
                  v-for="(image, index) in projectImages"
                  :key="`${image}-${index}`"
                  :src="image"
                  :alt="data?.title ?? ''"
                  :loading="index === 0 ? 'eager' : 'lazy'"
                  :fetchpriority="index === 0 ? 'high' : 'auto'"
                  :class="[
                    'project-stage-image absolute inset-0 h-full w-full object-cover',
                    index === activeProjectImageIndex ? 'project-stage-image-active' : 'project-stage-image-idle',
                  ]"
                />
              </div>
              <figcaption class="absolute left-3 top-3 border border-black/20 bg-black/60 px-3 py-2 text-[10px] uppercase tracking-[0.28em] text-amber-100 backdrop-blur-sm">
                {{ data?.categories?.[0] || "Projet photo" }}
              </figcaption>
              <div
                v-if="projectImages.length > 1"
                class="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/72 via-black/18 to-transparent px-2.5 pb-2.5 pt-6"
              >
                <div class="flex items-center gap-1">
                  <button
                    v-for="(image, index) in projectImages"
                    :key="`dot-${image}-${index}`"
                    type="button"
                    :aria-label="`Afficher l'image ${index + 1}`"
                    class="h-1.5 rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    :class="index === activeProjectImageIndex ? 'w-4 bg-amber-100/95' : 'w-1.5 bg-white/55 hover:bg-white/75'"
                    @click="setActiveProjectImage(index)"
                  />
                </div>
                <span class="project-image-counter text-[8px] uppercase tracking-[0.24em] text-amber-50/90">
                  {{ String(activeProjectImageIndex + 1).padStart(2, '0') }}/{{ String(projectImages.length).padStart(2, '0') }}
                </span>
              </div>
            </figure>

            <ContentRenderer v-if="data" :value="data" />
          </div>

          <section v-if="data?.pinterestUrl" class="mt-10 space-y-4 lg:mt-12">
            <div class="max-w-[42rem]">
              <h2 class="font-display text-3xl leading-none text-amber-400 lg:text-4xl">
                Le petit moodboard
              </h2>
              <p class="mt-2 text-sm leading-6 text-stone-300">
                Quelques images pour prolonger l'idée avant de passer à l'action.
              </p>
            </div>

            <div class="overflow-hidden bg-stone-950/55 p-3 lg:p-4">
              <a
                data-pin-do="embedBoard"
                data-pin-scale-height="240"
                data-pin-scale-width="220"
                :href="data?.pinterestUrl"
              />
            </div>
          </section>
        </article>

        <aside
          ref="asideRef"
          class="lg:relative lg:col-span-4 lg:self-start"
          :style="desktopAsideStyle"
        >
          <div
            ref="formPanelRef"
            class="space-y-5 bg-stone-950/60 p-5 lg:max-h-[calc(100vh-6rem)] lg:overflow-auto lg:p-6"
            :style="desktopFormPanelStyle"
          >
            <div>
              <p class="text-[11px] uppercase tracking-[0.3em] text-amber-300/70">
                Participation
              </p>
              <h2 class="mt-3 font-display text-3xl leading-[0.92] text-white lg:text-[2.5rem]">
                Je veux participer
              </h2>
            </div>

            <p class="max-w-[28ch] text-base leading-7 text-stone-200">
              Très simple, accorde-moi 24 secondes et demi pour remplir ce court formulaire et c&apos;est parti.
            </p>

            <p class="text-sm italic leading-6 text-amber-300/75">
              Ou klaxonne-moi dans la rue.
            </p>

            <iframe
              data-tally-src="https://tally.so/embed/n0MpAj?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
              loading="lazy"
              width="100%"
              height="638"
              frameborder="0"
              marginheight="0"
              marginwidth="0"
              title="Participer à un Projet Photo avec Macojaune"
              class="min-h-[638px] bg-transparent"
            />
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getProjectCanonicalImageUrl, getProjectImages, getProjectStatusLabel } from '../../utils/projects'

const { toSiteUrl } = useAssetUrls()

const { path, params } = useRoute()
const requestKey = computed(() => `project-document:${String(params?.permalink ?? '')}`)
const { data } = await useAsyncData(requestKey, () =>
  queryContent('/projects').where({ permalink: `${params?.permalink}` }).findOne(),
)

const projectImages = computed(() => getProjectImages(data.value))
const activeProjectImageIndex = ref(0)
const articleRef = ref<HTMLElement | null>(null)
const asideRef = ref<HTMLElement | null>(null)
const formPanelRef = ref<HTMLElement | null>(null)

let autoCycleHandle: ReturnType<typeof window.setInterval> | null = null
let lastScrollTriggerY = 0
let detachProjectScrollHandler: (() => void) | null = null
let projectScrollContainer: HTMLElement | Window | null = null
let detachDesktopStickyHandlers: (() => void) | null = null

const desktopAsideStyle = ref<Record<string, string>>({})
const desktopFormPanelStyle = ref<Record<string, string>>({})

const projectMeta = computed(() => {
  const items: string[] = []

  if (Array.isArray(data.value?.categories) && data.value.categories[0]) {
    items.push(String(data.value.categories[0]))
  }

  const statusLabel = getProjectStatusLabel(data.value?.projectStatus)
  if (statusLabel) {
    items.push(statusLabel)
  }

  return items
})

const title = data.value?.title ? `${data.value?.title} | Projets photo du Macojaune` : 'Le site du Macojaune'
useHead({
  title,
  meta: [
    {
      name: 'title',
      content: title,
    },
    {
      name: 'description',
      content: data.value?.description,
    },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: toSiteUrl(path) },
    { property: 'og:title', content: title },
    {
      property: 'og:description',
      content: data.value?.description,
    },
    { property: 'og:image', content: getProjectCanonicalImageUrl(projectImages.value[0], toSiteUrl('')) },
    {
      property: 'twitter:card',
      content: 'summary_large_image',
    },
    { property: 'twitter:url', content: toSiteUrl(path) },
    { property: 'twitter:title', content: title },
    {
      property: 'twitter:description',
      content: data.value?.description,
    },
    { property: 'twitter:image', content: getProjectCanonicalImageUrl(projectImages.value[0], toSiteUrl('')) },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'http://schema.org/',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            item: {
              '@id': 'https://macojaune.com',
              name: 'Homepage',
            },
          },
          {
            '@type': 'ListItem',
            position: 2,
            item: {
              '@id': 'https://macojaune.com/projets/',
              name: 'Projets',
            },
          },
          {
            '@type': 'ListItem',
            position: 3,
            item: {
              '@id': `https://macojaune.com/projets/${params.permalink}`,
              name: params.permalink,
            },
          },
        ],
      }),
    },
    { type: 'text/javascript', src: 'https://tally.so/widgets/embed.js', async: true, defer: true },
    {
      type: 'text/javascript',
      innerHTML: `var d=document,w="https://tally.so/widgets/embed.js",v=function(){"undefined"!=typeof Tally?Tally.loadEmbeds():d.querySelectorAll("iframe[data-tally-src]:not([src])").forEach((function(e){e.src=e.dataset.tallySrc}))};if("undefined"!=typeof Tally)v();else if(d.querySelector('script[src="'+w+'"]')==null){var s=d.createElement("script");s.src=w,s.onload=v,s.onerror=v,d.body.appendChild(s);}`,
    },
  ],
})

const setActiveProjectImage = (index: number) => {
  if (!projectImages.value.length) {
    activeProjectImageIndex.value = 0
    return
  }

  activeProjectImageIndex.value = ((index % projectImages.value.length) + projectImages.value.length) % projectImages.value.length
}

const advanceProjectImage = () => {
  if (projectImages.value.length < 2) {
    return
  }

  setActiveProjectImage(activeProjectImageIndex.value + 1)
}

const updateDesktopStickyPanel = () => {
  if (!asideRef.value || !formPanelRef.value || window.innerWidth < 1024) {
    desktopAsideStyle.value = {}
    desktopFormPanelStyle.value = {}
    return
  }

  const aside = asideRef.value
  const panel = formPanelRef.value
  const panelHeight = panel.offsetHeight
  const articleHeight = articleRef.value?.offsetHeight || panelHeight
  const asideRect = aside.getBoundingClientRect()
  const asideTop = asideRect.top + window.scrollY
  const asideWidth = asideRect.width
  const stopOffset = 80
  const maxFixedTop = 80
  const virtualAsideHeight = Math.max(panelHeight, articleHeight)
  const stopPoint = asideTop + virtualAsideHeight - panelHeight - stopOffset

  desktopAsideStyle.value = {
    minHeight: `${virtualAsideHeight}px`,
  }

  if (window.scrollY <= asideTop - maxFixedTop) {
    desktopFormPanelStyle.value = {}
    return
  }

  if (window.scrollY >= stopPoint) {
    desktopFormPanelStyle.value = {
      position: 'absolute',
      inset: 'auto 0 0 0',
    }
    return
  }

  desktopFormPanelStyle.value = {
    position: 'fixed',
    top: `${maxFixedTop}px`,
    left: `${asideRect.left}px`,
    width: `${asideWidth}px`,
  }
}

onMounted(() => {
  Tally.loadEmbeds()
  ;(function (d) {
    const f = d.getElementsByTagName('SCRIPT')[0]
    const p = d.createElement('SCRIPT')
    p.type = 'text/javascript'
    p.async = true
    p.src = '//assets.pinterest.com/js/pinit.js'
    f.parentNode.insertBefore(p, f)
  })(document)

  if (projectImages.value.length < 2) {
    return
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!prefersReducedMotion) {
    autoCycleHandle = window.setInterval(() => {
      advanceProjectImage()
    }, 4200)
  }

  const mainScroller = document.querySelector('.main')
  projectScrollContainer =
    mainScroller instanceof HTMLElement && mainScroller.scrollHeight > mainScroller.clientHeight + 4
      ? mainScroller
      : window

  const handleScroll = () => {
    if (prefersReducedMotion || projectImages.value.length < 2) {
      return
    }

    const currentY = projectScrollContainer instanceof Window
      ? projectScrollContainer.scrollY
      : projectScrollContainer instanceof HTMLElement
        ? projectScrollContainer.scrollTop
        : window.scrollY

    if (Math.abs(currentY - lastScrollTriggerY) < 260) {
      return
    }

    lastScrollTriggerY = currentY
    advanceProjectImage()
  }

  const scrollTarget = projectScrollContainer || window
  scrollTarget.addEventListener('scroll', handleScroll, { passive: true })
  detachProjectScrollHandler = () => scrollTarget.removeEventListener('scroll', handleScroll)

  const handleWindowFrame = () => {
    updateDesktopStickyPanel()
  }

  window.addEventListener('scroll', handleWindowFrame, { passive: true })
  window.addEventListener('resize', handleWindowFrame)
  window.requestAnimationFrame(updateDesktopStickyPanel)
  detachDesktopStickyHandlers = () => {
    window.removeEventListener('scroll', handleWindowFrame)
    window.removeEventListener('resize', handleWindowFrame)
  }
})

onUnmounted(() => {
  detachProjectScrollHandler?.()
  detachProjectScrollHandler = null
  detachDesktopStickyHandlers?.()
  detachDesktopStickyHandlers = null

  if (autoCycleHandle) {
    window.clearInterval(autoCycleHandle)
    autoCycleHandle = null
  }
})
</script>

<style scoped>
.project-content {
  color: rgb(245 245 244);
}

.project-body {
  max-width: 72ch;
  display: flow-root;
}

.project-inline-media {
  box-shadow: 0 28px 70px rgb(0 0 0 / 0.38);
}

.project-stage-image {
  transition:
    opacity 900ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 1200ms cubic-bezier(0.22, 1, 0.36, 1),
    filter 900ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: opacity, transform, filter;
}

.project-stage-image-active {
  opacity: 1;
  transform: scale(1);
  filter: saturate(1) contrast(1);
}

.project-stage-image-idle {
  opacity: 0;
  transform: scale(1.035);
  filter: saturate(0.9) contrast(0.92);
}

.project-image-counter {
  font-size: 8px;
  line-height: 1;
  letter-spacing: 0.24em;
}

.project-content :deep(p:first-of-type) {
  max-width: 26ch;
  font-size: clamp(1.08rem, 0.98rem + 0.45vw, 1.45rem);
  font-weight: 500;
  line-height: 1.52;
  color: rgb(245 245 244);
}

.project-content :deep(p:nth-of-type(2)) {
  max-width: 34ch;
  font-size: 1.02rem;
  line-height: 1.8;
  color: rgb(214 211 209);
}

.project-content :deep(h2),
.project-content :deep(h3),
.project-content :deep(h4),
.project-content :deep(h5),
.project-content :deep(h6) {
  margin-top: 3.25rem;
  margin-bottom: 1rem;
  font-family: var(--font-display, inherit);
  font-size: clamp(2rem, 3vw, 3rem);
  line-height: 0.94;
  color: rgb(251 191 36);
}

.project-content :deep(h3),
.project-content :deep(h4),
.project-content :deep(h5),
.project-content :deep(h6) {
  font-size: clamp(1.5rem, 2vw, 2rem);
  line-height: 0.96;
  color: rgb(255 251 235);
}

.project-content :deep(p),
.project-content :deep(li) {
  font-size: 1.05rem;
  line-height: 1.85;
  color: rgb(231 229 228);
}

.project-content :deep(p + p) {
  margin-top: 1.2rem;
}

.project-content :deep(ul),
.project-content :deep(ol) {
  margin-top: 1.25rem;
  padding-left: 1.25rem;
}

.project-content :deep(a) {
  color: rgb(252 211 77);
  text-decoration: none;
}

.project-content :deep(a:hover) {
  color: rgb(253 230 138);
}

.project-content :deep(blockquote) {
  clear: both;
  margin-top: 2rem;
  padding-left: 1rem;
  border-left: 1px solid rgb(251 191 36 / 0.35);
  color: rgb(214 211 209);
}

@media (max-width: 1023px) {
  .project-body,
  .project-content :deep(p:first-of-type),
  .project-content :deep(p:nth-of-type(2)) {
    max-width: none;
  }

  .project-inline-media {
    float: none;
    width: 100%;
    margin: 0 0 1.25rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .project-stage-image {
    transition: none;
  }
}
</style>
