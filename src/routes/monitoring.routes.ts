import { Response, Router } from "express";
import { redisClient } from "../redis/redis";
import { AuthMiddleware } from "../config/types";


export const monitoringRoutes = Router();

monitoringRoutes.get(
  "/rate-limit-logs",
  async (req: AuthMiddleware, res: Response) => {
    const { endpoint, limit = 20 } = req.query as {
      endpoint?: string;
      limit?: string;
    };
    if (!endpoint) {
      res.status(400).json({
        success: false,
        message: "Missing Endpoint.",
      });
    }
    try {
      const keys = await redisClient.keys(`analytics:${endpoint}`);
      const data = await Promise.all(
        keys.slice(0, Number(limit)).map(async (key) => {
          const count = await redisClient.get<number>(key);
          const abuseStatus = (await redisClient.get(
            key.replace("analytics", "abuse")
          ))
            ? true
            : false;
          return {
            identifier: key.split(":").pop(),
            count: count ?? 0,
            abusive: abuseStatus,
          };
        })
      );

      res.json({
        success: true,
        endpoint,
        records: data.sort((a, b) => b.count - a.count),
      });
    } catch (error) {
      console.error("stats error", error);
      res.status(500).json({ success: false, message: "Internal error" });
    }
  }
);
