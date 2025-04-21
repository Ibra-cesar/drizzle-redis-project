import { Request, Response, Router } from "express";

const todosRoutes = Router()

todosRoutes.get('/', (req:Request, res:Response) => {
    res.send({message: "GET todos"})
})
todosRoutes.post('/', (req:Request, res:Response) => {
    res.send({message: "CREATE new todos"})
})
todosRoutes.put('/:id', (req:Request, res:Response) => {
    res.send({message: "UPDATE a todos"})
})
todosRoutes.delete('/:id', (req:Request, res:Response) => {
    res.send({message: "DELETE a todos"})
})

export default todosRoutes;