import { Request, Response } from "express";
import { recipeSchema, resultRecipe } from "./recipeSchema";
import { geminiRecipe } from "../../config/googleAi";
import util from "util";

export async function createRecipe(req: Request, res: Response) {
  try {
    //get prompt from req body and parsed it
    const parsed = recipeSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error });
    }
    //if success grab ingredient from zod and normalize to string :D O=>
    const { ingredients } = parsed.data;
    const normalize = ingredients.join(", ");
    //passed the string to gemini o_>
    const recipe = await geminiRecipe(normalize);
    if('success' in recipe && recipe.success === false){
        return res.status(500).json({message: recipe.message, error: recipe.errorDetail})
    }
    //cheking for text generation success
    //structured error for better deug, because the SHITTY BUG IS KILLING MEEEE. hehe
    console.log(
      "Recipe Data:",
      util.inspect(recipe, {
        showHidden: false,
        depth: null,
        colors: true,
      })
    );
    //parsed the recipe to zod object.
    const fullRecipe = resultRecipe.safeParse(recipe);

    if (!fullRecipe.success)
      return res.status(400).json({ message: "Response is not valid", error: fullRecipe.error.format() });
    //if succes grab the result P_P
    const result = fullRecipe.data
    //RESPONSE TO THE FUCKING LOSERS WHO CAN'T COOK haha.
    res
      .status(201)
      .json({ message: "Recipe created successfully", data: result });
  } catch (error) {
    console.error("Recipe Maker Failed", error);
    res
      .status(500)
      .json({ message: "Failed to make recipe, internal server error" });
  }
}
export async function getAllRecipe() {
  return;
}
export async function getRecipeById() {
  return;
}
export async function deleteRecipe() {
  return;
}
