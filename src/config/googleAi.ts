import { GoogleGenAI } from "@google/genai";
import { GOOGLE_GEMINI_API_KEY } from "./env"; // Make sure this path is correct

const ai = new GoogleGenAI({ apiKey: GOOGLE_GEMINI_API_KEY });

interface Recipe {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
}

export async function geminiRecipe(ingredients: string): Promise<Recipe | { success: false; message: string; errorDetail: string }> {
  // Added a return type for clarity, adjust as needed
  const prompt = `
  Generate a cheap and creative recipe using ONLY the following ingredients: ${ingredients}.
  The response MUST be a single JSON object representing ONE recipe, with the following structure:
  {
    "title": "Recipe Title",
    "description": "A brief description of the recipe.",
    "ingredients": ["ingredient1", "ingredient2", ...],
    "instructions": ["step1", "step2", ...]
  }
  Ensure all field names ("title", "description", "ingredients", "instructions") are exactly as specified.
  Do not wrap the JSON object in an array.
  `; // Key change: "single JSON object" and "Do not wrap..."

  try {
    const generationResult = await ai.models.generateContent({
      model: "gemini-1.5-flash-latest",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
      },
    });
    const responseText = generationResult.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      console.error(
        "Error: No text content in Gemini response",
        JSON.stringify(generationResult, null, 2)
      ); 
      // Return a structured error object or throw an error, matching controller's expectations
      return {
        success: false,
        message: "Failed to get recipe text from AI.",
        errorDetail: "No text content",
      };
    }

    return JSON.parse(responseText); //this is an object
  } catch (e) {
    console.error("Error in geminiRecipe function:", e);
    return {
      success: false,
      message: "Response from AI was not valid JSON or API error.",
      errorDetail: e instanceof Error ? e.message : String(e),
    };
  }
}
