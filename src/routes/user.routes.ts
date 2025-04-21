import { Request, Response, Router } from "express";

const usersRoutes = Router()

usersRoutes.get('/', (req: Request, res: Response) => {
    res.send({message: "GET all users"})
})
usersRoutes.get('/:id', (req: Request, res: Response) => {
    res.send({message: "GET a users"})
})
usersRoutes.post('/', (req: Request, res: Response) => {
    res.send({message: "CREATE new users"})
})
usersRoutes.put('/:id', (req: Request, res: Response) => {
    res.send({message: "UPDATE a users"})
})
usersRoutes.delete('/:id', (req: Request, res: Response) => {
    res.send({message: "DELETE a users"})
})

export default usersRoutes;