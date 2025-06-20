import { Response } from "express";
import { recipeSchema, resultRecipe } from "./recipeSchema";
import { geminiRecipe } from "../../config/googleAi";
import { db } from "../../drizzle/db";
import { recipesTable } from "../../drizzle/schema";
import { and, eq } from "drizzle-orm";
import { AuthMiddleware } from "../../config/types";

export async function createRecipe(req: AuthMiddleware, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    //get prompt from req body and parsed it
    const parsed = recipeSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error,success:false });
    }
    //if success grab ingredient from zod and normalize to string :D O=>
    const { ingredients } = parsed.data;
    const normalize = ingredients.join(", ");
    //passed the string to gemini o_>
    const recipe = await geminiRecipe(normalize);
    if ("success" in recipe && recipe.success === false) {
      return res
        .status(500)
        .json({ message: recipe.message, error: recipe.errorDetail, success:false });
    }
    //parsed the recipe to zod object.
    const fullRecipe = resultRecipe.safeParse(recipe);

    if (!fullRecipe.success)
      return res.status(400).json({
        message: "Response is not valid",
        error: fullRecipe.error.format(),
        success:false
      });
    //if succes grab the result P_P
    const result = fullRecipe.data;
    //RESPONSE TO THE FUCKING LOSERS WHO CAN'T COOK haha.

    const [completeRecipe] = await db
      .insert(recipesTable)
      .values({
        userId: userId, // Ensure userId is always a string
        title: result.title,
        ingredients: result.ingredients,
        instruction: result.instructions,
        description: result.description,
      })
      .returning({
        id: recipesTable.id,
        title: recipesTable.title,
        description: recipesTable.description,
        ingredients: recipesTable.ingredients,
        instruction: recipesTable.instruction,
      });
    return res
      .status(201)
      .json({ message: "Recipe created successfully", data: completeRecipe, success:true });
  } catch (error) {
    console.error("Recipe Maker Failed", error);
    return res
      .status(500)
      .json({ message: "Failed to make recipe, internal server error", success:false });
  }
}
export async function getAllRecipe(req: AuthMiddleware, res: Response) {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "User is unauthenticated.", success:false });
  }
  try {
    const recipe = await db.query.recipesTable.findMany({
      where: eq(recipesTable.userId, userId),
      columns: {
        id: true,
        title: true ,
        description: true,
        ingredients: true,
        instruction: true,
      }
    });
    return res.status(200).json({ data: recipe, success:true });
  } catch (error) {
    return res.status(404).json({ message: "Recipe is not found", error, success:false });
  }
}
export async function getRecipeById(req: AuthMiddleware, res: Response) {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ message: "User is not Authenticated.", success:false });
  }

  if (!id) {
    return res.status(400).json({ message: "Recipe ID is required.", success:false });
  }

  try {
    const recipeById = await db.query.recipesTable.findFirst({
      columns: {
        title: true,
        description: true,
        ingredients: true,
        instruction: true,
      },
      where: (recipe) => and(eq(recipe.userId, userId), eq(recipe.id, id)),
    });
    if (!recipeById) {
      return res.status(404).json({ message: "Recipe is not found." });
    }
    return res.status(200).json({ data: recipeById, success:true });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to get recipe.", success: false, error });
  }
}
export async function deleteRecipe(req: AuthMiddleware, res: Response) {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ message: "User is not Authenticated.", success:false });
  }

  if (!id) {
    return res.status(400).json({ message: "Recipe ID is required.", success:false });
  }

  try {
    const [deletedRecipe] = await db
      .delete(recipesTable)
      .where(and(eq(recipesTable.userId, userId), eq(recipesTable.id, id)))
      .returning({ title: recipesTable.title });

    return res
      .status(200)
      .json({ message: "Recipe deleted.", success: true, data: deletedRecipe });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete recipe",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
