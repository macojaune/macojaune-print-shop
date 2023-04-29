<template lang="pug">
.page-payer.px-4
  h1.mt-8.mb-3.text-5xl.text-amber-400.uppercase Par ici les paiements !
  p.text-white Régler une séance, un tirage, ou un simple don ? C'est possible.
  .amount.mt-8(v-show="!state.show")
    .flex.gap-3(class="flex-col md:flex-row justify-center")
      .relative.grow
        input.p-4.pr-12.w-full.block.rounded-md.bg-stone-800.text-white.font-bold(class="focus:outline-none focus:ring-amber-300" v-model="state.amount" @change.prevent="initPayment" type="number" placeholder="Rentre le montant ici (ex: 667.00)" autofocus )
        .absolute.inset-y-0.right-0.pr-6.flex.items-center.pointer-events-none
          span.text-white.font-bold.leading-none €
      button.p-4.rounded-md.bg-amber-400.text-black.text-center(@click="initPayment")
        span.font-bold.text-center(v-if="!state.loading") Ensuite, clique ici
        svg.text-center(v-else class="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24")
          circle( class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4")
          path( class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z")
  .info.mt-8(v-show="state.show")
    p.mb-4.text-2xl.text-white.text-center Régler
      span.text-4xl.font-bold.text-orange-400(@click="state.show=false") {{ state.amount}}€
      |
      span.text-white ?
      |
      span.text-xl Simple comme bonjour.
  .payment(v-show="state.show")
    p.text-center.text-white Insérez vos informations en toute tranquilité.
    form#payme-form(@submit.prevent="doPay")
      #card-errors.text-red-500.font-bold.my-4(role='alert') {{state.error}}
      #card.p-4.rounded
      .p-4
        button.p-5.block.w-full.text-center.bg-amber-400.text-black.rounded-md.font-bold(type="submit") BOOM !
</template>

<script setup>
import { reactive } from 'vue'
import axios from 'axios'
import { useStripe } from 'vue-use-stripe'

useHead({
  title: 'Payer - Macojaune.com',
  script: [
    { src: 'https://js.stripe.com/v3', async: true }
  ]
})
const route = useRoute()
const config = useRuntimeConfig()

const { stripe } = useStripe({
  key: config.public.stripePublicKey || ''
})

const state = reactive({
  show: false,
  error: '',
  loading: false,
  intent: {},
  amount: route.params.amount,
  name: route.params.name,
  card: null
})

const initPayment = async () => {
  try {
    state.loading = true
    const { data } = await axios.get(
      `${config.public.serverURL}/payme`,
      {
        params: {
          amount: state.amount,
          name: state.name
        }
      }
    )
    state.intent = data // todo check error
    state.loading = false
    state.show = true
    // stripe
    state.elements = stripe.value?.elements({
      clientSecret: data.client_secret,
      locale: 'fr-FR',
      appearance: {
        theme: 'night',
        labels: 'floating'
      }
    })

    state.card = state.elements?.create('payment')
    state.card.mount('#card')
    state.card.addEventListener('change', ({ error }) => {
      state.error = error ? error.message : ''
    })
  } catch (e) {
    console.error(e)
    if (e) {
      alert(
        "Une erreur s'est produite, ping moi sur Telegram que je corrige"
      )
      window.location = 'https://t.me/macojaune'
    }
  }
}

const doPay = async () => {
  state.loading = true
  const { paymentIntent, error } = await stripe.value?.confirmPayment({
    elements: state.elements,
    confirmParams: {
      return_url: 'https://macojaune.com/merci/' + state.amount
    }
  })
  state.loading = false
  if (error) {
    state.error = error.message
    console.error(error)
  } else if (paymentIntent.status === 'succeeded') { await navigateTo('/merci/' + state.amount, { replace: true }) }
  console.log('success payment')
}
</script>

<style lang="stylus" scoped>
//#payer
//  //background-color #ffcf00
//  #card
//    //background-color #2c5fa7
</style>
