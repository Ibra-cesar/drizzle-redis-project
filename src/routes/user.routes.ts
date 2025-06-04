import { Response, Router } from "express";
import {
  deleteUser,
  getUser,
  getUserById,
} from "../actions/auth/author/authorizeUser";
import { authMiddleware } from "../actions/middleware/authMiddleware";
import { rateLimiter } from "../actions/middleware/rateLimiter";
import { AuthMiddleware } from "../config/types";

const usersRoutes = Router();
usersRoutes.use(authMiddleware)

usersRoutes.get(
  "/",
  rateLimiter({
    endpoint: "all-users",
    rate_limit: { limit: 20, window: 60 },
    useUserId: true,
  }),
  async (req: AuthMiddleware, res: Response) => {
      if (!req.user) {
        res.status(401).json({
          message: "Unaouthorized",
          success: false,
        });
      }
      await getUser(req, res);
    }
);

usersRoutes.get(
  "/me",
  rateLimiter({
    endpoint: "user-by-id",
    rate_limit: { limit: 20, window: 60 },
    useUserId: true,
  }),
  async (req: AuthMiddleware, res: Response) => {
    if (!req.user) {
      res.status(401).json({
        message: "Unaouthorized",
        success: false,
      });
    }
    await getUserById(req, res);
  }
);

usersRoutes.get(
  "/:id",
  rateLimiter({
    endpoint: "user-by-id",
    rate_limit: { limit: 20, window: 60 },
    useUserId: true,
  }),
  async (req: AuthMiddleware, res: Response) => {
      if (!req.user) {
        res.status(401).json({
          message: "Unaouthorized",
          success: false,
        });
      }
      await getUserById(req, res);
    }
);

usersRoutes.delete("/:id", authMiddleware, deleteUser);

export default usersRoutes;
