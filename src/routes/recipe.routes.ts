import { Request, Response, Router } from "express";

const recipesRoutes = Router()

recipesRoutes.get('/all', (req:Request, res:Response) => {
    res.send({message: "GET todos"})
})
recipesRoutes.get('/:id', (req:Request, res:Response) => {
    res.send({message: "GET todos"})
})
recipesRoutes.post('/', (req:Request, res:Response) => {
    res.send({message: "CREATE new todos"})
})
recipesRoutes.delete('/:id', (req:Request, res:Response) => {
    res.send({message: "DELETE a todos"})
})

export default recipesRoutes;