import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as labsyncSchema from './schema/labsync';

export const db = drizzle(process.env.DATABASE_URL!, { schema: labsyncSchema });
export * from './schema/labsync';