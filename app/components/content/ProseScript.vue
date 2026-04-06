<template>
  <span v-if="showBlockedHint" class="sr-only">
    Embedded script blocked for safety.
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  src?: string
}>()

type InstagramWindow = Window & {
  instgrm?: {
    Embeds?: {
      process?: () => void
    }
  }
}

const normalizeScriptSrc = (value?: string) => {
  if (!value) {
    return null
  }

  const trimmedValue = value.trim()
  if (!trimmedValue) {
    return null
  }

  if (trimmedValue.startsWith("//")) {
    return `https:${trimmedValue}`
  }

  if (trimmedValue.startsWith("/")) {
    return null
  }

  return trimmedValue
}

const isAllowedScript = (value: string) =>
  /^https:\/\/www\.instagram\.com\/embed\.js(?:[?#].*)?$/i.test(value)

const safeScriptSrc = computed(() => {
  const normalizedSrc = normalizeScriptSrc(props.src)
  if (!normalizedSrc) {
    return null
  }

  return isAllowedScript(normalizedSrc) ? normalizedSrc : null
})

const showBlockedHint = computed(() => import.meta.dev && Boolean(props.src) && !safeScriptSrc.value)

const processInstagramEmbeds = () => {
  if (!import.meta.client) {
    return
  }

  ;(window as InstagramWindow).instgrm?.Embeds?.process?.()
}

const ensureSafeScriptLoaded = () => {
  if (!import.meta.client || !safeScriptSrc.value) {
    return
  }

  const existingScript = document.querySelector<HTMLScriptElement>(`script[data-prose-script="${safeScriptSrc.value}"]`)
  if (existingScript) {
    processInstagramEmbeds()
    return
  }

  const scriptElement = document.createElement("script")
  scriptElement.src = safeScriptSrc.value
  scriptElement.async = true
  scriptElement.setAttribute("data-prose-script", safeScriptSrc.value)
  scriptElement.addEventListener("load", processInstagramEmbeds, { once: true })
  document.body.appendChild(scriptElement)
}

onMounted(() => {
  ensureSafeScriptLoaded()
  processInstagramEmbeds()
})

onUpdated(() => {
  processInstagramEmbeds()
})
</script>
