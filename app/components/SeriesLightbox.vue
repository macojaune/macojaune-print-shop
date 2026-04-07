<template>
  <Teleport to="body">
    <transition name="series-lightbox">
      <div
        v-if="tile"
        class="series-lightbox-shell fixed inset-0 z-50"
        role="dialog"
        aria-modal="true"
        :aria-label="`Visionneuse de la série ${seriesTitle}`"
      >
        <div
          class="series-lightbox-backdrop absolute inset-0 bg-black/97 backdrop-blur-md"
          @click="emit('close')"
        />

        <div class="relative flex min-h-screen items-center justify-center px-3 py-4 sm:px-5 sm:py-5">
          <div class="series-lightbox-panel relative flex w-full max-w-[96vw] items-center justify-center">
            <button
              type="button"
              class="series-lightbox-close absolute right-0 top-0 z-10 inline-flex min-h-11 items-center px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-stone-300 transition hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              @click="emit('close')"
            >
              Fermer
            </button>

            <div class="series-lightbox-frame flex w-full max-w-[94vw] flex-col gap-3 pt-10 sm:max-w-[92vw] sm:pt-12 md:flex-row md:items-center md:gap-5">
              <div class="series-lightbox-meta flex w-full shrink-0 justify-center md:w-[10rem] md:self-stretch md:justify-center">
                <div class="flex flex-col text-center lg:text-left">
                  <p class="font-display text-lg uppercase leading-[0.92] text-white sm:text-xl">
                    {{ seriesTitle }}
                  </p>
                  <p
                    v-if="seriesDateLabel"
                    class="mt-1 text-[10px] uppercase tracking-[0.28em] text-amber-300/72"
                  >
                    {{ seriesDateLabel }}
                  </p>
                </div>
              </div>

              <div class="flex min-w-0 flex-1 flex-col items-center">
                <div class="series-lightbox-media flex w-full justify-center">
                  <RunImage
                    :src="tile.src"
                    :alt="tile.alt || seriesTitle"
                    variant="detail"
                    sizes="92vw"
                    loading="eager"
                    fetchpriority="high"
                    class="max-h-[74vh] max-w-[92vw] w-auto object-contain md:max-h-[88vh] md:max-w-[calc(92vw-12rem)]"
                  />
                </div>

                <div
                  v-if="canNavigate"
                  class="series-lightbox-nav mt-2 flex w-full max-w-[92vw] items-center justify-between gap-4 lg:mt-3"
                >
                  <button
                    type="button"
                    class="inline-flex min-h-11 items-center px-0 py-2 text-[10px] uppercase tracking-[0.3em] text-stone-300 transition hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                    @click.stop="emit('previous')"
                  >
                    Précédente
                  </button>

                  <p class="text-[10px] uppercase tracking-[0.3em] text-stone-400">
                    {{ positionLabel }}
                  </p>

                  <button
                    type="button"
                    class="inline-flex min-h-11 items-center px-0 py-2 text-[10px] uppercase tracking-[0.3em] text-stone-300 transition hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                    @click.stop="emit('next')"
                  >
                    Suivante
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script lang="ts" setup>
import type { SeriesGalleryTile } from "../utils/runs"

const props = withDefaults(defineProps<{
  tile: SeriesGalleryTile | null
  seriesTitle: string
  seriesDateLabel?: string
  positionLabel?: string
  canNavigate?: boolean
}>(), {
  seriesDateLabel: "",
  positionLabel: "",
  canNavigate: false,
})

const emit = defineEmits<{
  close: []
  previous: []
  next: []
}>()

const onKeydown = (event: KeyboardEvent) => {
  if (!props.tile) {
    return
  }

  if (event.key === "Escape") {
    emit("close")
  }

  if (event.key === "ArrowLeft" && props.canNavigate) {
    event.preventDefault()
    emit("previous")
  }

  if (event.key === "ArrowRight" && props.canNavigate) {
    event.preventDefault()
    emit("next")
  }
}

if (import.meta.client) {
  watch(() => props.tile, (tile) => {
    document.body.style.overflow = tile ? "hidden" : ""
  }, { immediate: true })

  onMounted(() => {
    window.addEventListener("keydown", onKeydown)
  })

  onBeforeUnmount(() => {
    document.body.style.overflow = ""
    window.removeEventListener("keydown", onKeydown)
  })
}
</script>

<style scoped>
.series-lightbox-enter-active .series-lightbox-backdrop,
.series-lightbox-leave-active .series-lightbox-backdrop {
  transition: opacity 220ms cubic-bezier(0.25, 1, 0.5, 1);
}

.series-lightbox-enter-active .series-lightbox-panel,
.series-lightbox-leave-active .series-lightbox-panel {
  transition:
    opacity 280ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 280ms cubic-bezier(0.22, 1, 0.36, 1);
  transform-origin: center center;
  will-change: opacity, transform;
}

.series-lightbox-enter-active .series-lightbox-meta,
.series-lightbox-enter-active .series-lightbox-close,
.series-lightbox-enter-active .series-lightbox-nav,
.series-lightbox-leave-active .series-lightbox-meta,
.series-lightbox-leave-active .series-lightbox-close,
.series-lightbox-leave-active .series-lightbox-nav {
  transition:
    opacity 240ms cubic-bezier(0.25, 1, 0.5, 1),
    transform 240ms cubic-bezier(0.25, 1, 0.5, 1);
  will-change: opacity, transform;
}

.series-lightbox-enter-active .series-lightbox-meta,
.series-lightbox-enter-active .series-lightbox-close,
.series-lightbox-enter-active .series-lightbox-nav {
  transition-delay: 40ms;
}

.series-lightbox-enter-from .series-lightbox-backdrop,
.series-lightbox-leave-to .series-lightbox-backdrop {
  opacity: 0;
}

.series-lightbox-enter-from .series-lightbox-panel,
.series-lightbox-leave-to .series-lightbox-panel {
  opacity: 0;
  transform: translate3d(0, 10px, 0) scale(0.985);
}

.series-lightbox-enter-from .series-lightbox-meta,
.series-lightbox-enter-from .series-lightbox-close,
.series-lightbox-enter-from .series-lightbox-nav,
.series-lightbox-leave-to .series-lightbox-meta,
.series-lightbox-leave-to .series-lightbox-close,
.series-lightbox-leave-to .series-lightbox-nav {
  opacity: 0;
  transform: translate3d(0, 8px, 0);
}

@media (prefers-reduced-motion: reduce) {
  .series-lightbox-enter-active .series-lightbox-backdrop,
  .series-lightbox-leave-active .series-lightbox-backdrop,
  .series-lightbox-enter-active .series-lightbox-panel,
  .series-lightbox-leave-active .series-lightbox-panel,
  .series-lightbox-enter-active .series-lightbox-meta,
  .series-lightbox-enter-active .series-lightbox-close,
  .series-lightbox-enter-active .series-lightbox-nav,
  .series-lightbox-leave-active .series-lightbox-meta,
  .series-lightbox-leave-active .series-lightbox-close,
  .series-lightbox-leave-active .series-lightbox-nav {
    transition-delay: 0ms !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
