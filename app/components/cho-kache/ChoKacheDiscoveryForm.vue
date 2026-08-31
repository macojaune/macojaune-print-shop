<template>
  <section
    id="signaler"
    class="scroll-mt-6 border-y border-amber-200/20 bg-stone-950 px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-14"
    aria-labelledby="discovery-form-title"
  >
    <div v-if="submissionResult" class="grid gap-8 lg:grid-cols-12 lg:items-center">
      <div class="lg:col-span-8">
        <p
          id="discovery-form-title"
          ref="formTitle"
          tabindex="-1"
          class="mb-0 max-w-[11ch] font-display text-5xl uppercase leading-[0.88] text-amber-400 outline-none sm:text-6xl"
        >
          Bien reçu.
        </p>
        <p class="mb-0 mt-5 max-w-[38rem] text-lg leading-8 text-stone-200">
          Tu as signalé la photo n°{{ submissionResult.publicNumber }}. Je vais vérifier tout ça.
        </p>
        <p class="mb-0 mt-3 text-sm leading-6 text-stone-400">
          Référence {{ submissionResult.reference }}
        </p>
      </div>
      <button
        type="button"
        class="inline-flex min-h-12 w-fit items-center justify-center border border-amber-300/55 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-amber-200 transition hover:bg-amber-300 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-4 focus-visible:ring-offset-stone-950 lg:col-span-4 lg:justify-self-end"
        @click="emit('close')"
      >
        Retour à la chasse
      </button>
    </div>

    <div v-else class="grid gap-10 lg:grid-cols-12 lg:gap-14">
      <div class="lg:col-span-4">
        <h2
          id="discovery-form-title"
          ref="formTitle"
          tabindex="-1"
          class="max-w-[9ch] font-display text-5xl uppercase leading-[0.88] text-amber-400 outline-none sm:text-6xl"
        >
          Laquelle as-tu trouvée ?
        </h2>
        <p class="mb-0 mt-6 max-w-[30rem] text-base leading-7 text-stone-300">
          Le numéro et le code suffisent. Le reste est facultatif.
        </p>
        <button
          type="button"
          class="mt-6 inline-flex min-h-11 items-center py-2 text-xs uppercase tracking-[0.24em] text-stone-400 transition hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-4 focus-visible:ring-offset-stone-950"
          @click="emit('close')"
        >
          Fermer le formulaire
        </button>
      </div>

      <form class="min-w-0 space-y-8 lg:col-span-8" novalidate @submit.prevent="submitDiscovery">
        <fieldset>
          <legend class="mb-3 text-sm font-semibold text-white">
            Numéro de la photo
          </legend>
          <div class="grid grid-cols-3 gap-2 sm:gap-3">
            <label
              v-for="print in prints"
              :key="print.publicNumber"
              :class="form.publicNumber === print.publicNumber
                ? 'border-amber-300 bg-amber-300 text-black'
                : 'border-white/20 bg-black text-white hover:border-amber-200/55'"
              class="relative flex min-h-20 cursor-pointer items-center justify-center border px-2 text-center transition focus-within:ring-2 focus-within:ring-amber-300 focus-within:ring-offset-2 focus-within:ring-offset-stone-950 sm:min-h-24"
            >
              <input
                v-model="form.publicNumber"
                type="radio"
                name="publicNumber"
                :value="print.publicNumber"
                class="sr-only"
              >
              <span class="font-display text-3xl uppercase leading-none sm:text-4xl">
                N°{{ print.publicNumber }}
              </span>
            </label>
          </div>
          <p v-if="fieldErrors.publicNumber" class="mb-0 mt-2 text-sm text-amber-200" role="alert">
            {{ fieldErrors.publicNumber }}
          </p>
        </fieldset>

        <div>
          <template v-if="hasQrCode">
            <p class="mb-2 text-sm font-semibold text-white">
              Code interne
            </p>
            <div class="flex min-h-12 items-center justify-between gap-4 border border-amber-300/45 bg-amber-300/8 px-4 py-3">
              <span class="text-sm text-amber-100">Code récupéré depuis le QR</span>
              <span class="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">OK</span>
            </div>
          </template>
          <template v-else>
            <label for="discovery-code" class="mb-2 block text-sm font-semibold text-white">
              Code au dos de la photo
            </label>
            <input
              id="discovery-code"
              v-model.trim="form.internalCode"
              name="internalCode"
              type="text"
              maxlength="64"
              autocomplete="one-time-code"
              autocapitalize="characters"
              spellcheck="false"
              class="min-h-12 w-full border border-white/25 bg-black px-4 py-3 text-base uppercase text-white outline-none transition placeholder:text-stone-400 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/40"
              placeholder="Ex. CHO-7K4M-9Q2P"
              :aria-invalid="Boolean(fieldErrors.internalCode)"
              :aria-describedby="fieldErrors.internalCode ? 'discovery-code-error' : 'discovery-code-hint'"
            >
            <p id="discovery-code-hint" class="mb-0 mt-2 text-sm leading-6 text-stone-400">
              C'est le code imprimé derrière le tirage, pas son numéro public.
            </p>
            <p v-if="fieldErrors.internalCode" id="discovery-code-error" class="mb-0 mt-2 text-sm text-amber-200" role="alert">
              {{ fieldErrors.internalCode }}
            </p>
          </template>
        </div>

        <div class="grid gap-7 sm:grid-cols-2 sm:gap-6">
          <div class="min-w-0">
            <label for="discovery-contact" class="mb-2 block text-sm font-semibold text-white">
              Ton @ ou ton email <span class="font-normal text-stone-400">(facultatif)</span>
            </label>
            <input
              id="discovery-contact"
              v-model.trim="form.contact"
              name="contact"
              type="text"
              maxlength="100"
              autocomplete="email"
              class="min-h-12 w-full border border-white/25 bg-black px-4 py-3 text-base text-white outline-none transition placeholder:text-stone-400 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/40"
              placeholder="@tonpseudo ou toi@email.com"
            >
          </div>

          <div class="min-w-0">
            <label for="discovery-location-note" class="mb-2 block text-sm font-semibold text-white">
              Le lieu, en quelques mots <span class="font-normal text-stone-400">(facultatif)</span>
            </label>
            <input
              id="discovery-location-note"
              v-model.trim="form.locationNote"
              name="locationNote"
              type="text"
              maxlength="160"
              class="min-h-12 w-full border border-white/25 bg-black px-4 py-3 text-base text-white outline-none transition placeholder:text-stone-400 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/40"
              placeholder="Ex. près du marché"
            >
          </div>
        </div>

        <div class="border-y border-white/12 py-6">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p class="mb-1 text-sm font-semibold text-white">
                Position GPS <span class="font-normal text-stone-400">(facultatif)</span>
              </p>
              <p class="mb-0 max-w-[34rem] text-sm leading-6 text-stone-400">
                Je ne la demande que si tu appuies sur le bouton. Tu peux aussi la retirer avant l'envoi.
              </p>
            </div>
            <button
              v-if="!form.coordinates"
              type="button"
              :disabled="isLocating"
              class="inline-flex min-h-11 shrink-0 items-center justify-center border border-white/25 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:border-amber-300 hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:cursor-wait disabled:opacity-55"
              @click="requestLocation"
            >
              {{ isLocating ? 'Je cherche ta position' : 'Ajouter ma position' }}
            </button>
            <button
              v-else
              type="button"
              class="inline-flex min-h-11 shrink-0 items-center justify-center border border-amber-300/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200 transition hover:bg-amber-300 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              @click="removeLocation"
            >
              Retirer ma position
            </button>
          </div>
          <p v-if="form.coordinates" class="mb-0 mt-3 text-sm text-amber-200" role="status">
            Position ajoutée, précision d'environ {{ Math.round(form.coordinates.accuracy) }} m.
          </p>
          <p v-if="locationError" class="mb-0 mt-3 text-sm text-amber-200" role="alert">
            {{ locationError }}
          </p>
        </div>

        <div>
          <label for="discovery-media" class="mb-2 block text-sm font-semibold text-white">
            Photos ou vidéos <span class="font-normal text-stone-400">(facultatif)</span>
          </label>
          <input
            id="discovery-media"
            ref="mediaInput"
            name="media"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,video/mp4,video/quicktime,video/webm"
            class="block min-h-12 w-full cursor-pointer border border-white/25 bg-black text-sm text-stone-300 file:mr-4 file:min-h-12 file:border-0 file:border-r file:border-white/20 file:bg-stone-100 file:px-4 file:text-xs file:font-semibold file:uppercase file:tracking-[0.14em] file:text-black hover:border-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            @change="handleMediaSelection"
          >
          <p class="mb-0 mt-2 text-sm leading-6 text-stone-400">
            Jusqu'à 3 fichiers, 25 Mo chacun, 50 Mo au total.
          </p>
          <ul v-if="form.media.length" class="mt-3 space-y-1 text-sm text-stone-300">
            <li v-for="file in form.media" :key="`${file.name}-${file.size}`" class="break-all">
              {{ file.name }} · {{ formatFileSize(file.size) }}
            </li>
          </ul>
          <p v-if="fieldErrors.media" class="mb-0 mt-2 text-sm text-amber-200" role="alert">
            {{ fieldErrors.media }}
          </p>
        </div>

        <label class="flex cursor-pointer items-start gap-3 border border-white/15 bg-black/45 p-4 text-sm leading-6 text-stone-300">
          <input v-model="form.allowSharing" name="allowSharing" type="checkbox" class="mt-1 h-5 w-5 shrink-0 accent-amber-400">
          <span>Tu peux repartager mes photos ou vidéos sur tes réseaux.</span>
        </label>

        <input
          v-model="form.website"
          name="website"
          type="text"
          tabindex="-1"
          autocomplete="off"
          aria-hidden="true"
          class="absolute -left-[9999px] h-px w-px overflow-hidden"
        >

        <div>
          <p v-if="submitError" class="mb-4 border border-amber-300/35 bg-amber-300/8 px-4 py-3 text-sm leading-6 text-amber-100" role="alert">
            {{ submitError }}
          </p>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="inline-flex min-h-12 w-full items-center justify-center bg-amber-400 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-stone-950 disabled:cursor-wait disabled:bg-stone-600 disabled:text-white sm:w-auto"
          >
            {{ isSubmitting ? "J'envoie" : 'Envoyer ma trouvaille' }}
          </button>
          <p class="mb-0 mt-3 max-w-[40rem] text-xs leading-5 text-stone-400">
            Rien ne sera publié automatiquement. Si tu coches l'autorisation, je pourrai repartager les fichiers plus tard.
          </p>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ChoKachePrint } from '../../data/cho-kache'

type Coordinates = {
  latitude: number
  longitude: number
  accuracy: number
}

type SubmissionResult = {
  publicNumber: number
  reference: string
}

const props = defineProps<{
  prints: ChoKachePrint[]
  initialPublicNumber?: number
  initialInternalCode?: string
}>()

const emit = defineEmits<{
  close: []
  submitted: [result: SubmissionResult]
}>()

const allowedMediaTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'video/mp4',
  'video/quicktime',
  'video/webm',
])
const maxFileSize = 25 * 1024 * 1024
const maxTotalSize = 50 * 1024 * 1024
const maxFiles = 3

const formTitle = ref<HTMLElement | null>(null)
const mediaInput = ref<HTMLInputElement | null>(null)
const isSubmitting = ref(false)
const isLocating = ref(false)
const locationError = ref('')
const submitError = ref('')
const submissionResult = ref<SubmissionResult | null>(null)

const defaultPublicNumber = props.initialPublicNumber
  ?? 0

const form = reactive({
  publicNumber: defaultPublicNumber,
  internalCode: props.initialInternalCode?.trim() || '',
  contact: '',
  locationNote: '',
  coordinates: null as Coordinates | null,
  media: [] as File[],
  allowSharing: false,
  website: '',
})

const fieldErrors = reactive({
  publicNumber: '',
  internalCode: '',
  media: '',
})

const hasQrCode = computed(() => Boolean(props.initialInternalCode?.trim()))

const focusFirst = async () => {
  await nextTick()
  formTitle.value?.focus({ preventScroll: true })
}

defineExpose({ focusFirst })

const formatFileSize = (size: number) => {
  const megabytes = size / (1024 * 1024)
  return `${megabytes.toFixed(1)} Mo`
}

const clearFieldErrors = () => {
  fieldErrors.publicNumber = ''
  fieldErrors.internalCode = ''
  fieldErrors.media = ''
  submitError.value = ''
}

const validateForm = () => {
  clearFieldErrors()
  let isValid = true

  if (!props.prints.some(print => print.publicNumber === form.publicNumber)) {
    fieldErrors.publicNumber = 'Choisis le numéro indiqué sur la photo.'
    isValid = false
  }

  if (!form.internalCode.trim()) {
    fieldErrors.internalCode = 'Ajoute le code imprimé au dos de la photo.'
    isValid = false
  }

  if (form.media.length > maxFiles) {
    fieldErrors.media = `Choisis ${maxFiles} fichiers maximum.`
    isValid = false
  }

  const totalSize = form.media.reduce((total, file) => total + file.size, 0)
  const invalidFile = form.media.find(file => !allowedMediaTypes.has(file.type) || file.size > maxFileSize)

  if (invalidFile) {
    fieldErrors.media = 'Un fichier est trop lourd ou son format n’est pas accepté.'
    isValid = false
  } else if (totalSize > maxTotalSize) {
    fieldErrors.media = 'Les fichiers dépassent 50 Mo au total.'
    isValid = false
  }

  return isValid
}

const handleMediaSelection = (event: Event) => {
  const input = event.target as HTMLInputElement
  form.media = Array.from(input.files || [])
  validateForm()
}

const requestLocation = () => {
  locationError.value = ''

  if (!navigator.geolocation) {
    locationError.value = "Ton navigateur ne permet pas d'ajouter la position. Tu peux écrire le lieu juste au-dessus."
    return
  }

  isLocating.value = true
  navigator.geolocation.getCurrentPosition(
    (position) => {
      form.coordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      }
      isLocating.value = false
    },
    () => {
      locationError.value = "Je n'ai pas pu récupérer ta position. Tu peux écrire le lieu juste au-dessus."
      isLocating.value = false
    },
    {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 300000,
    },
  )
}

const removeLocation = () => {
  form.coordinates = null
  locationError.value = ''
}

const getSubmitError = (error: unknown) => {
  if (!error || typeof error !== 'object') {
    return "L'envoi n'est pas passé. Réessaie dans un moment."
  }

  const data = 'data' in error && error.data && typeof error.data === 'object'
    ? error.data
    : null

  if (data && 'message' in data && typeof data.message === 'string') {
    return data.message
  }

  if (data && 'statusMessage' in data && typeof data.statusMessage === 'string') {
    return data.statusMessage
  }

  return "L'envoi n'est pas passé. Réessaie dans un moment."
}

const submitDiscovery = async () => {
  if (isSubmitting.value || !validateForm()) {
    return
  }

  isSubmitting.value = true
  submitError.value = ''

  const payload = new FormData()
  payload.append('publicNumber', String(form.publicNumber))
  payload.append('internalCode', form.internalCode.trim())
  payload.append('contact', form.contact)
  payload.append('locationNote', form.locationNote)
  payload.append('allowSharing', String(form.allowSharing))
  payload.append('website', form.website)

  if (form.coordinates) {
    payload.append('latitude', String(form.coordinates.latitude))
    payload.append('longitude', String(form.coordinates.longitude))
    payload.append('accuracy', String(form.coordinates.accuracy))
  }

  form.media.forEach(file => payload.append('media', file, file.name))

  try {
    const response = await $fetch<SubmissionResult>('/api/cho-kache/discoveries', {
      method: 'POST',
      body: payload,
    })

    submissionResult.value = response
    emit('submitted', response)
    await focusFirst()
  } catch (error) {
    submitError.value = getSubmitError(error)
  } finally {
    isSubmitting.value = false
  }
}
</script>
