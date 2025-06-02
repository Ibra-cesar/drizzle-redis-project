import { redisClient } from "../redis/redis";

interface RateLimit {
  endpoint: string;
  identifier: string; // user:id or ip:x.x.x.x
  limit: number;
  window: number; // in seconds
  globalLimit?: { limit: number; window: number };
  abuseBlockTime?: number; // in seconds
}

export class RateLimiterService {
  private endpoint: string;
  private identifier: string;
  private key: string;
  private abuseKey: string;
  private analyticsKey: string;
  private limit: number;
  private window: number;
  private globalKey: string;
  private globalLimit?: { limit: number; window: number };
  private abuseBlockTime: number;

  constructor(config: RateLimit) {
    this.endpoint = config.endpoint;
    this.identifier = config.identifier;
    this.key = `ratelimit:${config.endpoint}:${config.identifier}`;
    this.abuseKey = `abuse:${config.identifier}`;
    this.analyticsKey = `analytics:${config.endpoint}:${config.identifier}`;
    this.globalKey = `global-throttle:${config.endpoint}`;
    this.limit = config.limit;
    this.window = config.window;
    this.globalLimit = config.globalLimit;
    this.abuseBlockTime = config.abuseBlockTime ?? 300;
  }

  async isAbusive(): Promise<boolean> {
    try {
      return !!(await redisClient.get(this.abuseKey));
    } catch (error) {
      console.error("Error Cheking abuse status", error);
      return false;
    }
  }

  async increment(): Promise<number> {
    try {
      const pipeline = redisClient.multi();
      pipeline.incr(this.key);
      pipeline.ttl(this.key);

      const result = (await pipeline.exec()) as [Error | null, number | null][];

      if (!result) {
        throw new Error("Pipeline execution failed.");
      }

      const current = result[0][1] as number;
      const ttl = result[1][1] as number;

      if (ttl === -1) {
        await redisClient.expire(this.key, this.window);
      }

      await this.updateAnalytics();

      return current;
    } catch (error) {
      console.error("Error incrementing rate limit:", error);
      throw error;
    }
  }

  async markAbusive(): Promise<void> {
    try {
      await redisClient.set(this.abuseKey, "1", { ex: this.abuseBlockTime });

      console.warn(
        `marked as abusive: ${this.identifier}, for endpoint: ${this.endpoint}`
      );

      const abuseAnalitycsKey = `abuse-analitycs:${this.endpoint}`;
      await redisClient.incr(abuseAnalitycsKey);
      await redisClient.expire(abuseAnalitycsKey, 86400);
    } catch (error) {
      console.error("Error Marking abusice user:", error);
    }
  }

  async checkGlobalLimit(): Promise<boolean> {
    if (!this.globalLimit) return false;
    try {
      const pipeline = redisClient.multi();
      pipeline.incr(this.globalKey);
      pipeline.ttl(this.globalKey);

      const result = (await pipeline.exec()) as [Error | null, number | null][];

      const count = result[0][1] as number;
      const ttl = result[1][1] as number;

      if (ttl === -1) {
        await redisClient.expire(this.globalKey, this.globalLimit.window);
      }
      return count > this.globalLimit.limit;
    } catch (error) {
      console.error("Error checking global limit:", error);
      return false;
    }
  }

  async getAnalytics(): Promise<number> {
    try {
      const result = (await redisClient.get(this.analyticsKey)) as string;
      return parseInt(result || "0", 10);
    } catch (error) {
      console.error("Error getting analytics:", error);
      return 0;
    }
  }
  
  private async updateAnalytics(): Promise<void> {
    try {
      const pipeline = redisClient.multi();
      pipeline.incr(this.analyticsKey);
      pipeline.expire(this.analyticsKey, 3600); // 1 hour
      await pipeline.exec();
    } catch (error) {
      console.error("Error updating analytics:", error);
      // Don't throw - analytics are not critical
    }
  }
}
