<template>
  <div class="cho-kache-page w-full px-4 pb-8 pt-2 lg:px-6 lg:pb-16">
    <div class="mx-auto max-w-[1500px]">
      <header class="cho-hero relative overflow-hidden border-y border-amber-200/15 py-10 sm:py-14 lg:py-20">
        <div class="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-8">
          <div class="relative z-10 lg:col-span-7">
            <h1 class="max-w-[7ch] font-display text-[clamp(4.6rem,14vw,9rem)] uppercase leading-[0.76] tracking-[-0.02em] text-amber-400">
              Cho Kaché
            </h1>

            <p class="mt-8 max-w-[36rem] text-xl leading-8 text-stone-100 sm:text-2xl sm:leading-9">
              <template v-if="activeCount > 0">
                {{ activeCount }} {{ activeCount > 1 ? 'photos à trouver' : 'photo à trouver' }} en Guadeloupe. Si tu tombes sur l'une d'elles, elle est à toi. Prends une photo ou filme la trouvaille si ça te dit.
              </template>
              <template v-else>
                Rien à chercher pour le moment. La prochaine photo apparaîtra ici une fois cachée.
              </template>
            </p>

            <div class="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                v-if="activeCount > 0"
                ref="heroDiscoveryTrigger"
                type="button"
                data-umami-event="ChoKacheClick"
                data-umami-section="hero"
                data-umami-label="J'en ai trouvé un"
                data-umami-surface="cho_kache"
                class="inline-flex min-h-12 items-center justify-center bg-amber-400 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black"
                @click="openDiscoveryForm"
              >
                J'en ai trouvé un
              </button>
              <a
                v-if="activeCount > 0"
                href="#prints"
                class="inline-flex min-h-12 items-center justify-center border border-white/25 bg-white/[0.04] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:border-amber-200/60 hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-4 focus-visible:ring-offset-black"
              >
                {{ activeCount > 1 ? `Voir les ${activeCount} photos` : 'Voir la photo' }}
              </a>
            </div>

            <NuxtLink
              to="/blog/cho-kache"
              data-umami-event="ChoKacheClick"
              data-umami-section="hero"
              data-umami-label="Lire l'histoire du jeu"
              data-umami-surface="cho_kache"
              class="mt-6 inline-flex min-h-11 items-center py-2 text-xs uppercase tracking-[0.28em] text-stone-300 transition hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-4 focus-visible:ring-offset-black"
            >
              C'est quoi Cho Kaché ?
            </NuxtLink>
          </div>

          <div class="relative lg:col-span-5 lg:pl-8">
            <div class="ticket mx-auto max-w-[29rem] bg-stone-100 px-5 py-6 text-black shadow-[0_24px_70px_rgba(0,0,0,0.48)] sm:px-8 sm:py-8">
              <div class="flex items-center gap-4 border-b border-black/30 pb-4">
                <svg class="h-7 w-9 shrink-0" viewBox="0 0 36 28" fill="none" aria-hidden="true">
                  <path d="M0 14 12 2h11L12 14l11 12H12L0 14Z" fill="currentColor" />
                </svg>
                <p class="mb-0 flex-1 text-center font-display text-2xl uppercase leading-none text-black sm:text-3xl">
                  An nou joué
                </p>
                <svg class="h-7 w-9 shrink-0" viewBox="0 0 36 28" fill="none" aria-hidden="true">
                  <path d="m36 14-12-12H13l11 12-11 12h11l12-12Z" fill="currentColor" />
                </svg>
              </div>

              <div class="border-b border-black/30 py-6 text-center">
                <p class="mb-0 font-display text-[8.5rem] leading-[0.7] text-black sm:text-[10rem]">
                  {{ activeCount }}
                </p>
                <p class="mb-0 mt-6 font-display text-4xl uppercase leading-none text-black sm:text-5xl">
                  {{ activeCount > 1 ? 'photos à trouver' : 'photo à trouver' }}
                </p>
              </div>

              <div class="grid grid-cols-2 border-b border-black/30 py-4 text-center">
                <div class="border-r border-black/30 px-2">
                  <p class="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-black/60">
                    Lieu public
                  </p>
                  <p class="mb-0 font-display text-3xl leading-none text-black">
                    {{ publicPrints.length }}
                  </p>
                </div>
                <div class="px-2">
                  <p class="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-black/60">
                    Lieu secret
                  </p>
                  <p class="mb-0 font-display text-3xl leading-none text-black">
                    {{ secretPrints.length }}
                  </p>
                </div>
              </div>

              <p class="mb-0 pt-5 text-center text-xs font-semibold uppercase tracking-[0.22em] text-black">
                @macojaune · Guadeloupe
              </p>
            </div>
          </div>
        </div>
      </header>

      <div>
        <ChoKacheDiscoveryForm
          v-if="isDiscoveryFormOpen && activeCount > 0"
          ref="discoveryForm"
          :prints="activePrints"
          :initial-public-number="initialPublicNumber"
          :initial-internal-code="initialInternalCode"
          class="mt-8 lg:mt-12"
          @close="closeDiscoveryForm"
          @submitted="clearStoredQr"
        />

        <section id="prints" class="scroll-mt-8 py-16 lg:py-24" aria-labelledby="prints-title">
          <div class="grid gap-6 border-b border-amber-200/15 pb-10 lg:grid-cols-12 lg:items-end lg:gap-8">
            <h2 id="prints-title" class="max-w-[11ch] font-display text-5xl uppercase leading-[0.86] text-white sm:text-6xl lg:col-span-8 lg:text-[5.5rem]">
              À toi de chercher.
            </h2>
            <p class="max-w-[31rem] text-base leading-7 text-stone-300 lg:col-span-4">
              Quand je donne un lieu, tu peux partir de là. Pour le reste, faudra surveiller les indices sur mes réseaux.
            </p>
          </div>

          <ChoKacheMap
            v-if="activeCount > 0"
            :prints="activePrints"
            class="mt-10 lg:mt-14"
          />

          <div v-if="activeCount > 0" class="cache-wall mt-10 grid gap-6 lg:grid-cols-12 lg:gap-8">
            <article
              v-for="(print, index) in activePrints"
              :key="print.publicNumber"
              :class="[
                'cache-poster relative overflow-hidden border shadow-[0_24px_60px_rgba(0,0,0,0.28)]',
                print.location.visibility === 'public'
                  ? 'cache-poster-public border-black/15 bg-stone-100 text-black lg:col-span-7'
                  : 'cache-poster-secret border-amber-200/18 bg-stone-950 text-white lg:col-span-5',
                index === 2 ? 'lg:col-span-8 lg:col-start-3' : '',
              ]"
            >
              <div class="relative z-10 flex min-h-[31rem] flex-col p-6 sm:p-8 lg:min-h-[34rem]">
                <div class="flex items-start justify-between gap-4 border-b border-current/20 pb-5">
                  <p
                    :class="print.location.visibility === 'public' ? 'text-black' : 'text-white'"
                    class="mb-0 shrink-0 whitespace-nowrap font-display text-4xl uppercase leading-none"
                  >
                    Photo n°{{ print.publicNumber }}
                  </p>
                  <span
                    class="inline-flex min-h-8 items-center border border-current/35 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]"
                  >
                    Toujours à trouver
                  </span>
                </div>

                <div class="flex flex-1 flex-col justify-between pt-8">
                  <div>
                    <svg
                      v-if="print.location.visibility === 'public'"
                      class="h-12 w-12"
                      viewBox="0 0 48 48"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path d="M24 44S39 30.4 39 17A15 15 0 1 0 9 17c0 13.4 15 27 15 27Z" stroke="currentColor" stroke-width="3" />
                      <circle cx="24" cy="17" r="5" stroke="currentColor" stroke-width="3" />
                    </svg>
                    <svg
                      v-else
                      class="h-12 w-12 text-amber-300"
                      viewBox="0 0 48 48"
                      fill="none"
                      aria-hidden="true"
                    >
                      <rect x="9" y="20" width="30" height="22" stroke="currentColor" stroke-width="3" />
                      <path d="M16 20v-5a8 8 0 1 1 16 0v5" stroke="currentColor" stroke-width="3" />
                      <circle cx="24" cy="31" r="2.5" fill="currentColor" />
                    </svg>

                    <h3 class="mt-6 max-w-[10ch] font-display text-5xl uppercase leading-[0.86] sm:text-6xl">
                      {{ getPrintHeading(print) }}
                    </h3>
                  </div>

                  <div class="mt-12">
                    <template v-if="print.location.visibility === 'public'">
                      <p class="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-black/55">
                        Le point de départ
                      </p>
                      <p class="mb-0 font-display text-3xl uppercase leading-none text-black sm:text-4xl">
                        {{ print.location.label }}
                      </p>
                      <p class="mb-0 mt-2 text-sm leading-6 text-black/65">
                        {{ print.location.detail }}
                      </p>
                    </template>
                    <template v-else>
                      <p class="redacted-location mb-0 max-w-[17rem] text-sm font-semibold uppercase tracking-[0.2em] text-white">
                        Indice à venir
                      </p>
                    </template>

                    <p :class="print.location.visibility === 'public' ? 'text-stone-700' : 'text-stone-300'" class="mb-0 mt-6 max-w-[36rem] text-base leading-7">
                      {{ print.clue }}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          </div>
          <div v-else class="mt-10 border border-amber-200/18 bg-stone-950 px-6 py-14 text-center sm:px-10 sm:py-20">
            <p class="mb-0 font-display text-4xl uppercase leading-none text-white sm:text-5xl">
              Rien à chercher pour le moment.
            </p>
            <p class="mx-auto mb-0 mt-5 max-w-[34rem] text-base leading-7 text-stone-300">
              Les anciennes photos ne sont plus sur place. Je mettrai la prochaine ici une fois cachée.
            </p>
          </div>
        </section>

        <section id="trouve" class="scroll-mt-8 border-y border-amber-200/15 py-16 lg:py-24" aria-labelledby="found-title">
          <div class="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div class="lg:col-span-5">
              <h2 id="found-title" class="max-w-[8ch] font-display text-6xl uppercase leading-[0.84] text-amber-400 sm:text-7xl lg:text-[6rem]">
                Tu en as trouvé une ?
              </h2>
              <p class="mt-7 max-w-[30rem] text-lg leading-8 text-stone-200">
                Le tirage est à toi. Si tu veux, prends une photo ou une vidéo avant de repartir avec.
              </p>
            </div>

            <ol class="participation-slip bg-stone-100 text-black shadow-[0_24px_70px_rgba(0,0,0,0.45)] lg:col-span-7">
              <li v-for="(step, index) in participationSteps" :key="step.title" class="grid grid-cols-[3.5rem_1fr] gap-4 border-b border-black/20 px-5 py-6 last:border-b-0 sm:grid-cols-[5rem_1fr] sm:px-8 sm:py-8">
                <span class="font-display text-4xl leading-none text-black/35 sm:text-5xl" aria-hidden="true">
                  {{ String(index + 1).padStart(2, '0') }}
                </span>
                <div>
                  <h3 class="font-display text-3xl uppercase leading-none text-black sm:text-4xl">
                    {{ step.title }}
                  </h3>
                  <p class="mb-0 mt-3 max-w-[36rem] text-base leading-7 text-black/70">
                    {{ step.description }}
                  </p>
                </div>
              </li>
            </ol>
          </div>

          <div class="mt-10 flex flex-col items-start justify-between gap-5 border-t border-amber-200/15 pt-8 sm:flex-row sm:items-center">
            <p class="mb-0 max-w-[42rem] text-base leading-7 text-stone-300">
              Le numéro et le code au dos suffisent. Tu peux ajouter le reste si tu veux.
            </p>
            <button
              type="button"
              data-umami-event="ChoKacheClick"
              data-umami-section="participation"
              data-umami-label="Signaler ma trouvaille"
              data-umami-surface="cho_kache"
              class="inline-flex min-h-12 shrink-0 items-center justify-center border border-amber-300/55 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-amber-200 transition hover:bg-amber-300 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-4 focus-visible:ring-offset-black"
              @click="openDiscoveryForm"
            >
              Signaler ma trouvaille
            </button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChoKacheDiscoveryForm from '../../components/cho-kache/ChoKacheDiscoveryForm.vue'
import ChoKacheMap from '../../components/cho-kache/ChoKacheMap.vue'
import { choKachePrints } from '../../data/cho-kache'
import type { ChoKachePrint } from '../../data/cho-kache'

type DiscoveryFormHandle = {
  focusFirst: () => Promise<void>
}

const route = useRoute()
const router = useRouter()
const discoveryForm = ref<DiscoveryFormHandle | null>(null)
const heroDiscoveryTrigger = ref<HTMLElement | null>(null)
const discoveryTrigger = ref<HTMLElement | null>(null)
const isDiscoveryFormOpen = ref(false)
const initialInternalCode = ref('')
const initialPublicNumber = ref<number | undefined>()

const activePrints = computed(() => choKachePrints.filter(print => print.status === 'active'))
const activeCount = computed(() => activePrints.value.length)
const publicPrints = computed(() => activePrints.value.filter(print => print.location.visibility === 'public'))
const secretPrints = computed(() => activePrints.value.filter(print => print.location.visibility === 'secret'))

const getQueryValue = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] || '' : value || ''
const qrSessionKey = 'cho-kache:last-qr'
const getStoredQr = () => {
  try {
    const value = sessionStorage.getItem(qrSessionKey)
    return value ? JSON.parse(value) as { code?: unknown, publicNumber?: unknown } : null
  } catch {
    sessionStorage.removeItem(qrSessionKey)
    return null
  }
}

const openDiscoveryForm = async (event?: MouseEvent) => {
  if (event?.currentTarget instanceof HTMLElement) {
    discoveryTrigger.value = event.currentTarget
  }

  isDiscoveryFormOpen.value = true
  await nextTick()
  document.querySelector('#signaler')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  await discoveryForm.value?.focusFirst()
}

const closeDiscoveryForm = async () => {
  isDiscoveryFormOpen.value = false
  await nextTick()
  const trigger = discoveryTrigger.value || heroDiscoveryTrigger.value
  trigger?.focus({ preventScroll: true })
  document.querySelector('.cho-hero')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const clearStoredQr = () => {
  sessionStorage.removeItem(qrSessionKey)
}

onMounted(async () => {
  const queryCode = getQueryValue(route.query.code)
  const queryPublicNumber = Number.parseInt(getQueryValue(route.query.photo), 10)
  const storedQrData = getStoredQr()
  const storedCode = typeof storedQrData?.code === 'string' ? storedQrData.code : ''
  const storedPublicNumber = typeof storedQrData?.publicNumber === 'number'
    ? storedQrData.publicNumber
    : Number.NaN
  const shouldRestoreQr = !queryCode
    && route.hash === '#signaler'
    && activePrints.value.some(print => print.publicNumber === storedPublicNumber)

  if (activePrints.value.some(print => print.publicNumber === queryPublicNumber)) {
    initialPublicNumber.value = queryPublicNumber
  } else if (shouldRestoreQr) {
    initialPublicNumber.value = storedPublicNumber
  }

  if (queryCode) {
    initialInternalCode.value = queryCode.slice(0, 64)
    sessionStorage.setItem(qrSessionKey, JSON.stringify({
      code: initialInternalCode.value,
      publicNumber: initialPublicNumber.value,
    }))

    const safeQuery = { ...route.query }
    delete safeQuery.code
    await router.replace({ query: safeQuery, hash: '#signaler' })
  } else if (shouldRestoreQr) {
    initialInternalCode.value = storedCode.slice(0, 64)
  }

  if (queryCode || route.hash === '#signaler') {
    await openDiscoveryForm()
  }
})

const getPrintHeading = (print: ChoKachePrint) => {
  if (print.location.visibility === 'secret') {
    return 'Pas de point sur la carte.'
  }

  const hasCoordinates = Number.isFinite(print.location.latitude) && Number.isFinite(print.location.longitude)
  return hasCoordinates ? 'Tu sais où chercher.' : 'Le point arrive.'
}

const participationSteps = [
  {
    title: 'Avant de la décrocher',
    description: "Prends une photo ou fais une petite vidéo dans sa cachette, si tu y penses.",
  },
  {
    title: 'Scanne le QR code',
    description: "Il remplit le code tout seul. S'il ne passe pas, le même code est imprimé au dos.",
  },
  {
    title: 'Elle est à toi',
    description: "Tu peux repartir avec. Et si tu postes, pense à taguer @macojaune.",
  },
]

const title = 'Cho Kaché | Des photos à trouver en Guadeloupe'
const description = `${activePrints.value.length} ${activePrints.value.length > 1 ? 'photos à trouver' : 'photo à trouver'} en Guadeloupe. Certains lieux sont indiqués, pour les autres il faudra suivre les indices.`

useHead({
  title,
  meta: [
    { name: 'description', content: description },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://macojaune.com/cho-kache' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:image', content: 'https://macojaune.com/pictures/pexels-bakr-magrabi-9329771.jpg' },
    { property: 'twitter:card', content: 'summary_large_image' },
    { property: 'twitter:title', content: title },
    { property: 'twitter:description', content: description },
    { property: 'twitter:image', content: 'https://macojaune.com/pictures/pexels-bakr-magrabi-9329771.jpg' },
  ],
  link: [{ rel: 'canonical', href: 'https://macojaune.com/cho-kache' }],
})
</script>

<style scoped>
.cho-kache-page {
  --ticket-paper: #f5f5f4;
}

.cho-hero::before {
  position: absolute;
  inset: 0 38% 0 auto;
  width: 34rem;
  content: '';
  pointer-events: none;
  background: radial-gradient(circle, rgb(251 191 36 / 0.12), transparent 67%);
}

.ticket,
.participation-slip {
  background-color: var(--ticket-paper);
  background-image:
    linear-gradient(91deg, transparent 0%, rgb(0 0 0 / 0.025) 48%, transparent 51%),
    linear-gradient(0deg, rgb(255 255 255 / 0.25), transparent 24%);
}

.ticket {
  position: relative;
  clip-path: polygon(0 0, 3% 0.75%, 6% 0, 9% 0.75%, 12% 0, 15% 0.75%, 18% 0, 21% 0.75%, 24% 0, 27% 0.75%, 30% 0, 33% 0.75%, 36% 0, 39% 0.75%, 42% 0, 45% 0.75%, 48% 0, 51% 0.75%, 54% 0, 57% 0.75%, 60% 0, 63% 0.75%, 66% 0, 69% 0.75%, 72% 0, 75% 0.75%, 78% 0, 81% 0.75%, 84% 0, 87% 0.75%, 90% 0, 93% 0.75%, 96% 0, 100% 0.75%, 100% 99.25%, 97% 100%, 94% 99.25%, 91% 100%, 88% 99.25%, 85% 100%, 82% 99.25%, 79% 100%, 76% 99.25%, 73% 100%, 70% 99.25%, 67% 100%, 64% 99.25%, 61% 100%, 58% 99.25%, 55% 100%, 52% 99.25%, 49% 100%, 46% 99.25%, 43% 100%, 40% 99.25%, 37% 100%, 34% 99.25%, 31% 100%, 28% 99.25%, 25% 100%, 22% 99.25%, 19% 100%, 16% 99.25%, 13% 100%, 10% 99.25%, 7% 100%, 4% 99.25%, 0 100%);
}

.cache-poster {
  isolation: isolate;
}

.cache-poster-public::before {
  position: absolute;
  inset: 0;
  z-index: -1;
  content: '';
  opacity: 0.16;
  background-image:
    linear-gradient(to right, rgb(0 0 0 / 0.24) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(0 0 0 / 0.24) 1px, transparent 1px);
  background-size: 3rem 3rem;
  mask-image: linear-gradient(to bottom, black, transparent 80%);
}

.cache-poster-secret::before {
  position: absolute;
  right: -4rem;
  top: 5rem;
  z-index: -1;
  font-family: Tanker, sans-serif;
  font-size: clamp(15rem, 30vw, 26rem);
  line-height: 0.7;
  color: rgb(251 191 36 / 0.08);
  content: '?';
}

.redacted-location {
  position: relative;
  padding-block: 0.45rem;
}

.redacted-location::after {
  position: absolute;
  inset: 0;
  content: '';
  background: rgb(251 191 36 / 0.22);
  transform: rotate(-1deg);
}

.redacted-location::before {
  position: absolute;
  inset: 0.35rem -0.5rem;
  content: '';
  background: #000;
  transform: rotate(0.6deg);
}

.redacted-location {
  z-index: 0;
}

.redacted-location::before,
.redacted-location::after {
  z-index: -1;
}

@media (prefers-reduced-motion: no-preference) {
  .ticket {
    animation: ticket-settle 680ms cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  @keyframes ticket-settle {
    from {
      transform: translateY(-1.25rem) rotate(1.5deg);
      filter: blur(0.15rem);
    }
    to {
      transform: translateY(0) rotate(-0.45deg);
      filter: blur(0);
    }
  }
}

@media (max-width: 1023px) {
  .cho-hero::before {
    inset: 38% -12rem auto auto;
  }
}
</style>
