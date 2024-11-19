import stripe from 'stripe'
                import {fetchDataFromTurso} from '../../lib/db'

export default defineEventHandler(async (event) => {
const config = useRuntimeConfig(event)
  // Get the full request headers
  const headers = getRequestHeaders(event)

  // Get host from headers
  const host = headers.host

  // Get protocol (http/https)
  const protocol = getRequestProtocol(event)

  // Construct full URL
  const fullUrl = `${protocol}://${host}`
  const body = await readBody(event)
  const {title,description,productPrice, url} =body
  const s = stripe(config.stripeSecretKey)
  try {
    const result = await fetchDataFromTurso("SELECT option FROM config WHERE value='photozine_price'")
    const price:number = result?.[0]?.option ?? productPrice ?? 18
    const session = await s.checkout.sessions.create({
      line_items: [{
        price_data: {
          product_data: {
            name: title,
             description,
          },
          currency: 'eur',
          unit_amount: price * 100
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${fullUrl}/merci/${price}`,
      cancel_url: `${fullUrl}${url}?canceled=true`
    })
    await sendRedirect(event, session.url, 303)
  } catch (e) {
    console.error(e)
    return {
      statusCode: 500,
      body: JSON.stringify({error: e.message})
    }
  }
})
