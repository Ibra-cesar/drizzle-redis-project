import { Redis } from "@upstash/redis"
import { UPSTASH_REDIS_REST_TOKEN, UPSTASH_REDIS_REST_URL } from "../config/env"

export const redisClient = new Redis({
    url: UPSTASH_REDIS_REST_URL,
    token: UPSTASH_REDIS_REST_TOKEN,
})