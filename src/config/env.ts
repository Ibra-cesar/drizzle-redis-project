import { config } from "dotenv";

config({ path: `.env.development.local` });

export const { 
    PORT, 
    DB_NAME, 
    DB_PASSWORD, 
    DB_USER, 
    DB_HOST, 
    DB_URI } =
  process.env;
