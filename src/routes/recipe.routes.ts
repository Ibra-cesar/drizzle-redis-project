import { Response, Router } from "express";
import { createRecipe, deleteRecipe, getAllRecipe, getRecipeById } from "../actions/recipe/recipe";
import {
  AuthMiddleware,
  authMiddleware,
} from "../actions/middleware/authMiddleware";

const recipesRoutes = Router();

recipesRoutes.use(authMiddleware);

recipesRoutes.get("/all", async (req: AuthMiddleware, res: Response) => {
  if (!req.user) {
    res.status(401).json({ 
        message: "Unaouthorized", 
        success: false 
    });
  }
  await getAllRecipe(req, res);
});
recipesRoutes.get("/:id", async(req: AuthMiddleware, res: Response) => {
    if (!req.user) {
      res.status(401).json({
        message: "Unaouthorized",
        success: false,
      });
    }
    await getRecipeById(req, res)
});
recipesRoutes.post("/generate", async (req: AuthMiddleware, res: Response) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Unaouthorized",
    });
    return;
  }
  await createRecipe(req, res);
});
recipesRoutes.delete("/delete/:id", async(req: AuthMiddleware, res: Response) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unaouthorized",
      });
      return;
    }
    await deleteRecipe(req, res);
});

export default recipesRoutes;
