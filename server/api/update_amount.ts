import {fetchDataFromTurso} from '../../lib/db'
import { useServerStripe } from '#stripe/server'

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

		const stripe = await useServerStripe(event)
		sEvent = stripe.webhooks.constructEvent(body, headers['stripe-signature'], config.stripe.webhookSecret)

		if (sEvent.type === 'checkout.session.completed') {
			const intent = sEvent.data.object
			if (intent.payment_status === 'paid') {
				const result = await fetchDataFromTurso(event, "SELECT option FROM config WHERE value='photozine_price'")
				const price:number = result?.[0]?.option

				if (price) {
					const newPrice= getNextPrice(32,price)
					await fetchDataFromTurso(event, `UPDATE config SET option=${newPrice} WHERE value='photozine_price'`)

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
			body: JSON.stringify({error: e instanceof Error ? e.message : 'Unknown error'})
		}
	}
})
