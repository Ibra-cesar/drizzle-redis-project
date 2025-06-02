import { Response, Router } from "express";
import {
  createRecipe,
  deleteRecipe,
  getAllRecipe,
  getRecipeById,
} from "../actions/recipe/recipe";
import { rateLimiter } from "../actions/middleware/rateLimiter";
import { authMiddleware } from "../actions/middleware/authMiddleware";
import { AuthMiddleware } from "../config/types";

const recipesRoutes = Router();

recipesRoutes.use(authMiddleware);

recipesRoutes.get(
  "/all",
  rateLimiter({
    endpoint: "all-recipes",
    rate_limit: { limit: 30, window: 60 },
    useUserId: true,
  }),
  async (req: AuthMiddleware, res: Response) => {
    if (!req.user) {
      res.status(401).json({
        message: "Unaouthorized",
        success: false,
      });
    }
    await getAllRecipe(req, res);
  }
);
recipesRoutes.get(
  "/:id",
  rateLimiter({
    endpoint: "recipe-by-id",
    rate_limit: { limit: 30, window: 60 },
    useUserId: true,
  }),
  async (req: AuthMiddleware, res: Response) => {
    if (!req.user) {
      res.status(401).json({
        message: "Unaouthorized",
        success: false,
      });
    }
    await getRecipeById(req, res);
  }
);
recipesRoutes.post(
  "/generate",
  rateLimiter({
    endpoint: "generate-recipe",
    rate_limit: { limit: 5, window: 120 },
    useUserId: true,
    globalLimit: { limit: 300, window: 60 },
    abuseBlockTime: 360,
  }),
  async (req: AuthMiddleware, res: Response) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unaouthorized",
      });
      return;
    }
    await createRecipe(req, res);
  }
);
recipesRoutes.delete(
  "/delete/:id",
  rateLimiter({
    endpoint: "delete-recipe",
    rate_limit: { limit: 10, window: 60 },
    useUserId: true,
  }),
  async (req: AuthMiddleware, res: Response) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unaouthorized",
      });
      return;
    }
    await deleteRecipe(req, res);
  }
);

export default recipesRoutes;
