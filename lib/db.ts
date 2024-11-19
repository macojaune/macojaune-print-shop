import { createClient } from '@libsql/client';

export async function fetchDataFromTurso<T>(
  query: string,
  params?: any[] = []
): Promise<T[]> {
  try {
    const client = createClient({
      url: process.env.TURSO_DB,
      authToken: process.env.TURSO_TOKEN,
    });

    const result = await client.execute({ sql: query, args: params });
    return result.rows as T[];
    
  } catch (error) {
    console.error('Error fetching data from Turso:', error);
    throw error;
  }
}
