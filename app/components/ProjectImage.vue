<template>
  <img
    v-if="resolvedSrc"
    v-bind="$attrs"
    :src="resolvedSrc"
    :alt="alt"
    :width="dimensions.width"
    :height="dimensions.height"
    :loading="loading"
    :decoding="decoding"
    :fetchpriority="fetchpriority"
  >
</template>

<script setup lang="ts">
import {
  getProjectImageDimensions,
  getProjectImageUrl,
} from "../utils/projects"

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    src?: string
    alt: string
    loading?: "lazy" | "eager"
    decoding?: "async" | "auto" | "sync"
    fetchpriority?: "high" | "low" | "auto"
  }>(),
  {
    src: "",
    loading: "lazy",
    decoding: "async",
    fetchpriority: "auto",
  },
)

const resolvedSrc = computed(() => getProjectImageUrl(props.src))
const dimensions = computed(() => getProjectImageDimensions(props.src))
</script>
