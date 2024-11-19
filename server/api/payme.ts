import { z } from 'zod'
import {useServerStripe} from "#stripe/server";
const paymeSchema = z.object({
  name: z.string().optional(),
  amount: z.number()
})

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  const { amount } = getQuery(event)//, p => paymeSchema.parse(p))
  const s = await useServerStripe(event)

  // Create a PaymentIntent with the order amount and currency
  try {
    const paymentIntent = await s.paymentIntents.create({
      amount: amount * 1000,
      currency: 'eur',
      // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
      automatic_payment_methods: {
        enabled: true
      }
    })

    return { clientSecret: paymentIntent.client_secret }
  } catch (e) {
    throw createError({ statusCode: 400, statusMessage: e.message })
  }
})
