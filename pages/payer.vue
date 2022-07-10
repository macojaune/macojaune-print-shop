<template lang="pug">
.container.mx-auto
  h1.mt-8.mb-3.text-5xl.text-amber-400.uppercase Par ici les paiements !
  p.text-white Régler une séance, un tirage, ou un simple don ? C'est possible.
  .amount.mt-8(v-show="!state.show")
    p.mb-3.text-start.text-4xl.text-white Tout d'abord, le montant
    .flex.gap-3
      .relative.grow
        input.p-4.pr-12.w-full.block.rounded-md.bg-stone-800.text-white.font-bold(class="focus:outline-none focus:ring-amber-300" v-model="state.amount" @change.prevent="initPayment" type="number" placeholder="Entre le nombre de millions que tu veux me lancer" autofocus )
        .absolute.inset-y-0.right-0.pr-6.flex.items-center.pointer-events-none
          span.text-white.font-bold.leading-none €
      button.p-4.rounded-md.bg-amber-400.text-black.text-center(@click="initPayment")
        span.font-bold(v-if="!state.loading") Ensuite
        svg(v-else class="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24")
          circle( class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4")
          path( class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z")
  .info.mt-8(v-show="state.show")
    p.mb-3.text-2xl.text-white.text-center Régler 
      span.text-4xl.font-bold.text-orange-400 {{ state.amount}}€ 
      |
      span.text-white ?
      |
      span.text-xl Simple comme bonjour.
    p.text-white Insérez vos informations en toute tranquilité.
  .m-8(v-show="state.show")
    form#payme-form(@submit.prevent="doPay")
      #card-errors.text-danger.font-weight-bold.h5.fadeIn.my-4(role='alert') {{state.error}}
      #card.p-4.rounded
      .form-group.ma-4.text-center
        button.p-5.bg-amber-400.text-black.rounded-md.font-bold(type="submit") BOOM !
</template>

<script setup>
import {reactive} from "vue"
import axios from "axios"
import {useStripe} from 'vue-use-stripe'

useHead({
  title:"Payer - Macojaune.com",
  script: [
    {src: "https://js.stripe.com/v3", async: true}
  ]
})
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

const {stripe, stripeElements} = useStripe({
  key: config.public.stripePublicKey || '',
})
const colors = {
  base: {
    iconColor: '#fbbf24',
    color: '#fbbf24',
    fontWeight: 500,
    fontFamily: 'Hind, Roboto, sans-serif',
    fontSize: '18px',
    fontSmoothing: 'antialiased',
    ':-webkit-autofill': {
      color: '#fbbf24',
    },
    '::placeholder': {
      color: '#fff',
    },
  },
  invalid: {
    iconColor: '#DC3545',
    color: '#DC3545',
  },
}
const state = reactive({
  show: false,
  error: '',
  loading: false,
  intent: {},
  amount: route.params.amount,
  name: route.params.name,
  successUrl: 'https://macojaune.com/merci/',
  cancelUrl: route.fullPath, // maybe ajouter param cancel (?)
  card: null,
  iconStyle: 'solid',

})

const initPayment = async () => {
  try {
    state.loading = true
    const {data} = await axios.get(
      `${config.public.serverURL}/payme`,
      {
        params: {
          amount: state.amount,
          name: state.name,
        },
      }
    )
    console.log(data)
    state.intent = data // todo check error
    state.loading = false
    state.show = true
    //stripe
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
    state.card.addEventListener('change', ({error}) => {
      state.error = error ? error.message : ''
    })
  } catch (e) {
    console.error(e)
    // if (e) {
    //   alert(
    //     "Une erreur s'est produite, dis moi ça sur Telegram que je corrige"
    //   )
    //  // window.location = 'https://t.me/macojaune'
    // }
  }
}

const doPay = async () => {
  state.loading = true
  const {paymentIntent, error} = await stripe.value?.confirmPayment({
    elements: state.elements,
    confirmParams: {
      return_url: 'http://localhost:3000/merci/' + state.amount
    }
  })
  state.loading = false
  if (error) {
    state.error = error.message
    console.error(error)
  } else if (paymentIntent.status === 'succeeded')
    await navigateTo('/merci/'+state.amount,{replace:true})
    console.log('success payment')
}
</script>

<style lang="stylus" scoped>
//#payer
//  //background-color #ffcf00
//  #card
//    //background-color #2c5fa7
</style>
