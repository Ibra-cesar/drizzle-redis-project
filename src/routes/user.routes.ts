import { Router } from "express";
import { deleteUser, getUser, getUserById } from "../actions/auth/author/authorizeUser";
import { authMiddleware } from "../actions/middleware/authMiddleware";
import { rateLimiter } from "../actions/middleware/rateLimiter";

const usersRoutes = Router();

usersRoutes.get(
  "/",
  rateLimiter({
    endpoint: "all-users",
    rate_limit: { limit: 20, window: 60 },
    useUserId: true,
  }),
  authMiddleware,
  getUser
);

usersRoutes.get(
  "/:id",
  rateLimiter({
    endpoint: "user-by-id",
    rate_limit: { limit: 20, window: 60 },
    useUserId: true,
  }),
  authMiddleware,
  getUserById
);
usersRoutes.delete("/:id", authMiddleware, deleteUser);

export default usersRoutes;
