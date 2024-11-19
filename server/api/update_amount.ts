import {fetchDataFromTurso} from '../../lib/db'
import stripe from 'stripe'

function getNextPrice(startPrice: number, lastPrice: number): number {
  // If it's the first sale after start price
  if (lastPrice === startPrice) {
    return startPrice + 1;
  }

  // Calculate the last increase
  const lastIncrease = lastPrice - startPrice;

  // Calculate the next Fibonacci number
  let a = 1;
  let b = 1;

  while (b <= lastIncrease) {
    const temp = b;
    b = a + b;
    a = temp;
  }

  return startPrice + b;
}

export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig(event)
	let sEvent

	try {
		const headers = getRequestHeaders(event)
		const body = await readRawBody(event)

		const s = stripe(config.stripeSecretKey)
		sEvent = stripe.webhooks.constructEvent(body, headers['stripe-signature'], config.stripeWebhookSecret)

		if (sEvent.type === 'checkout.session.completed') {
			const intent = sEvent.data.object
			if (intent.payment_status === 'paid') {
				const result = await fetchDataFromTurso("SELECT option FROM config WHERE value='photozine_price'")
				const price:number = result?.[0]?.option

				if (price) {
					const newPrice= getNextPrice(32,price)
					await fetchDataFromTurso(`UPDATE config SET option=${newPrice} WHERE value='photozine_price'`)

					return {
						price: newPrice
					}
				}
			}
		}
		return {received: true}
	} catch (e) {
		console.error(e)
		return {
			statusCode: 400,
			body: JSON.stringify({error: e.message})
		}
	}
})
