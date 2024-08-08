// // import stripe from 'stripe'
//
// export default defineEventHandler(async (event) => {
//   const config = useRuntimeConfig(event)
//
//   const { product, url } = await readBody(event)
//   const s = stripe(config.stripeToken)
//
//   const session = await s.checkout.sessions.create({
//     line_items: [{
//       price_data: {
//         product_data: {
//           name: product.title
//         },
//         currency: 'eur',
//         unit_amount: product.price * 1000
//       },
//       quantity: 1
//     }],
//     mode: 'payment',
//     success_url: `${config.hostUrl}/merci/${product.price}`,
//     cancel_url: `${config.hostUrl}${url}?canceled=true`
//   })
//   await sendRedirect(event, session.url, 302)
// })
