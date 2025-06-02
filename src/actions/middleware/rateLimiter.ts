import { NextFunction, Response } from "express";
import { RateLimiterService } from "../../utils/RateLimiterSevice";
import { AuthMiddleware } from "../../config/types";

interface RateLimitRules {
  endpoint: string;
  rate_limit: {
    limit: number;
    window: number;
  };
  useUserId: boolean;
  globalLimit?: {
    limit: number;
    window: number;
  };
  abuseBlockTime?: number;
}

export const rateLimiter = (rule: RateLimitRules) => {
  return async (req: AuthMiddleware, res: Response, next: NextFunction) => {
    try {
      const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
      const userId = rule.useUserId && req.user?.id ? req.user.id : null;
      const identifier = userId ? `user:${userId}` : `ip:${ipAddress}`;

      const limiter = new RateLimiterService({
        endpoint: rule.endpoint,
        identifier,
        limit: rule.rate_limit.limit,
        window: rule.rate_limit.window,
        globalLimit: rule.globalLimit,
        abuseBlockTime: rule.abuseBlockTime
      })

      if (await limiter.isAbusive()) {
         res.status(429).json({ success: false, message: "Temporarily blocked due to abuse." });
         return
        }

      if (await limiter.checkGlobalLimit()) {
           res.status(429).json({
            success: false,
            message: "Global rate limit exceded, Try again later.",
          });
          return
        }

      const current = await limiter.increment();
      const remaining = Math.max(rule.rate_limit.limit - (current ?? 0), 0);

      res.setHeader("X-RateLimit-Limit", rule.rate_limit.limit.toString());
      res.setHeader("X-RateLimit-Remaining", remaining.toString());
      res.setHeader("X-RateLimit-Reset", rule.rate_limit.window.toString());

      if (current > rule.rate_limit.limit) {
       await limiter.markAbusive()
         res.status(429).send({
          success: false,
          message: "Too Much Request",
        });
        return
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Rate limiter error:", error, success: false });
      next();
      return;
    }
  };
};
