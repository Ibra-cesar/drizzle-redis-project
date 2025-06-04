import { Request, Response, Router } from "express";
import { signIn, signOut, singUp } from "../actions/auth/auth";
import { rateLimiter } from "../actions/middleware/rateLimiter";

const authRoutes = Router();

authRoutes.post(
  "/sign-up",
  rateLimiter({
    endpoint: "sign-up",
    rate_limit: { limit: 5, window: 60 },
    useUserId: false,
  }),
  async (req: Request, res: Response) => {
    await singUp(req.body, res);
  }
);

authRoutes.post(
  "/sign-in",
  rateLimiter({
    endpoint: "sign-in",
    rate_limit: { limit: 10, window: 60 },
    useUserId: false,
  }),
  async (req: Request, res: Response) => {
    await signIn(req.body, res);
  }
);
authRoutes.post("/sign-out", async (req: Request, res: Response) => {
  await signOut(req, res);
});

export default authRoutes;
