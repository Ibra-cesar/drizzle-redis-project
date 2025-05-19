import { Request, Response, Router } from "express";
import { createRecipe } from "../actions/recipe/recipe";

const recipesRoutes = Router()

recipesRoutes.get('/all', (req:Request, res:Response) => {
    res.send({message: "GET todos"})
})
recipesRoutes.get('/:id', (req:Request, res:Response) => {
    res.send({message: "GET todos"})
})
recipesRoutes.post('/generate', async(req:Request, res:Response) => {
    await createRecipe(req, res);
})
recipesRoutes.delete('/:id', (req:Request, res:Response) => {
    res.send({message: "DELETE a todos"})
})

export default recipesRoutes;