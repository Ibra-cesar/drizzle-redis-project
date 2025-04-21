import { Pool } from "pg";
import 'dotenv/config'
import { DB_URI } from "../config/env";
import { drizzle } from "drizzle-orm/node-postgres"

const pool = new Pool({
    connectionString: DB_URI!,
});

export const db = drizzle({
    client: pool,
    connection: {
        ssl: true,
        connectionString: DB_URI!
    }
})