import { z } from "zod";


export const recipeSchema = z.object({
    ingredients: z.array(z.string().min(1)).min(1, {message: "Ingredients cannot e empty!"})
})

export const resultRecipe = z.object({
    title: z.string(),
    description: z.string(),
    ingredients: z.array(z.string()),
    instructions: z.array(z.string())
})

export type structuredResult = z.infer<typeof resultRecipe>
export type recipeSchema = z.infer<typeof recipeSchema>