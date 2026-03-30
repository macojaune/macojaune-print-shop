import { createClient } from '@libsql/client';
import type { InArgs } from '@libsql/core/api';
import type { H3Event } from 'h3';
import { useRuntimeConfig } from '#imports';

export async function fetchDataFromTurso<T>(
  event: H3Event,
  query: string,
  params: InArgs = []
): Promise<T[]> {
  try {
    const {
      turso: { url, authToken },
    } = useRuntimeConfig(event);
    const client = createClient({
      url,
      authToken,
    });

    const result = await client.execute({ sql: query, args: params });
    return result.rows as T[];

  } catch (error) {
    console.error('Error fetching data from Turso:', error);
    throw error;
  }
}
