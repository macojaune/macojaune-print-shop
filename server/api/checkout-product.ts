import stripe from 'stripe'
import { fetchDataFromTurso } from '../../lib/db'

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
  const product = JSON.parse(body.product)
  const s = stripe(config.stripeSecretKey)
  try {
    const session = await s.checkout.sessions.create({
      line_items: [{
        adjustable_quantity: { enabled: true },
        price_data: {
          product_data: {
            name: product.title,
            description: product.description,
            images: product.images?.map((image: string) => `${fullUrl}${image}`) ?? [],
          },
          currency: 'eur',
          unit_amount: parseFloat(product.price) * 100
        },
        quantity: 1
      }],
      mode: 'payment',
      shipping_address_collection: {
        allowed_countries: ['FR', 'BE', 'DE', 'GF', 'PF', 'TF', 'ES', 'IT', 'NL', 'AT', 'CH', 'GP', 'MQ', 'GB', 'US', 'CA', 'AU', 'JP', 'MX', 'PT', 'BR', 'CZ', 'DK', 'FI', 'HU', 'NO', 'RU', 'SG', 'SE', 'KR', 'TW', 'VN', 'HK']
      },
      phone_number_collection: {
        enabled: true
      },
      success_url: `${fullUrl}/merci/${product.price}`,
      cancel_url: `${headers.referer}?canceled=true`
    })
    await sendRedirect(event, session.url, 303)
  } catch (e) {
    console.error(e)
    throw createError({
      statusCode: 500,
      body: JSON.stringify({ error: e.message })
    })
  }
}
)
