import { config } from "dotenv";

config({
  path: process.env.NODE_ENV === "production" ? ".env" : ".env.development.local",
});

function envVar(key: string): string{
  const value = process.env[key]
  if(!value) {
    throw new Error(`env variable ${key} is missing.`)
  }
  return value;
}

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
} = process.env;

export const COOKIES_SESSION_KEY = envVar("COOKIES_SESSION_KEY");
export const GOOGLE_GEMINI_API_KEY = envVar("GOOGLE_GEMINI_API_KEY");
