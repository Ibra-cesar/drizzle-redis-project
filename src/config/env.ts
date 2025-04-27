import { config } from "dotenv";

config({ path: `.env.development.local` });

export const {
  PORT,
  APP_PORT,
  DB_NAME,
  DB_PASSWORD,
  DB_USER,
  DB_HOST,
  DB_URI,
  UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN,
  COOKIES_SESSION_KEY,
} = process.env;
