import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'
import { DB_NAME, DB_PASSWORD, DB_URI, DB_USER } from './src/config/env'

export default defineConfig({
    out: './src/drizzle/migrations',
    schema: './src/drizzle/schema.ts',
    dialect: 'postgresql',
    dbCredentials: {
        database:DB_NAME,
        user:DB_USER,
        password:DB_PASSWORD,
        url:DB_URI!,
    }
})