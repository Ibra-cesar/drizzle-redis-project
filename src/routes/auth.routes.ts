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
    const result = await singUp(req.body, res);
    res.status(201).json({ data: result });
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
    const result = await signIn(req.body, res);
    res.status(200).json({ mesage: result });
  }
);
authRoutes.post("/sign-out", async (req: Request, res: Response) => {
  const result = await signOut(req, res);
  res.status(200).json({ message: result });
});

export default authRoutes;
