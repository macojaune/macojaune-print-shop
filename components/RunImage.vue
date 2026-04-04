<template>
  <picture v-if="fallbackSrc">
    <source v-if="avifSrcSet" type="image/avif" :srcset="avifSrcSet" :sizes="sizes">
    <source v-if="webpSrcSet" type="image/webp" :srcset="webpSrcSet" :sizes="sizes">
    <img
      v-bind="$attrs"
      :src="fallbackSrc"
      :alt="alt"
      :width="dimensions.width"
      :height="dimensions.height"
      :loading="loading"
      :decoding="decoding"
      :fetchpriority="fetchpriority"
    >
  </picture>
</template>

<script setup lang="ts">
import type { RunImageVariantName } from "../utils/runs"
import {
  getRunImageDimensions,
  getRunImageSrcSet,
  getRunImageUrl,
} from "../utils/runs"

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    src?: string
    alt: string
    variant?: RunImageVariantName
    sizes?: string
    loading?: "lazy" | "eager"
    decoding?: "async" | "auto" | "sync"
    fetchpriority?: "high" | "low" | "auto"
  }>(),
  {
    src: "",
    variant: "detail",
    sizes: "100vw",
    loading: "lazy",
    decoding: "async",
    fetchpriority: "auto",
  },
)

const dimensions = computed(() => getRunImageDimensions(props.src, props.variant))
const avifSrcSet = computed(() => getRunImageSrcSet(props.src, props.variant, "avif"))
const webpSrcSet = computed(() => getRunImageSrcSet(props.src, props.variant, "webp"))
const fallbackSrc = computed(() => getRunImageUrl(props.src, props.variant, "webp"))
</script>
