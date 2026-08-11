import { Pool, type PoolClient, type QueryResultRow } from 'pg';
import { authDatabaseUrl } from './primitives.ts';

let pool: Pool | undefined;

export const database = (): Pool => {
  const connectionString = authDatabaseUrl();
  if (!connectionString) throw new Error('RIPODOC_DATABASE_URL is required for application authentication.');
  pool ??= new Pool({ connectionString, max: 10, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : undefined });
  return pool;
};

export const query = async <T extends QueryResultRow>(text: string, params: readonly unknown[] = []): Promise<T[]> =>
  (await database().query<T>(text, [...params])).rows;

export const transaction = async <T>(operation: (client: PoolClient) => Promise<T>): Promise<T> => {
  const client = await database().connect();
  try {
    await client.query('BEGIN');
    const result = await operation(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
};

export const databaseConfigured = (): boolean => Boolean(authDatabaseUrl());
