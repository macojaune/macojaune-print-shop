import {fetchDataFromTurso} from '../../lib/db'

export default defineEventHandler(async (event) => {
  try {
    const result = await fetchDataFromTurso(event, "SELECT option FROM config WHERE value='photozine_price'")
    return {
      price: result?.[0]?.option ?? 18
    }
  } catch (e) {
    console.error(e)
    return {
      statusCode: 500,
      body: JSON.stringify({error: e instanceof Error ? e.message : 'Unknown error'})
    }
  }
})
