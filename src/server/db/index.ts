import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const globalForDb = globalThis as unknown as {
    conn: postgres.Sql | undefined
}

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/hiregate';

const client = globalForDb.conn ??
    postgres(connectionString, {
        max: process.env.DB_MAX_CONNECTIONS
            ? parseInt(process.env.DB_MAX_CONNECTIONS, 10) : 10
    });

if (process.env.NODE_ENV !== 'production') {
    globalForDb.conn = client
};

export const db = drizzle(client, { schema });
export type Database = typeof db