import { Request, Response, Router } from "express";
import { getUser, getUserById } from "../actions/auth/author/authorizeUser";
import { authMiddleware } from "../actions/middleware/authMiddleware";

const usersRoutes = Router()

usersRoutes.get('/',authMiddleware, getUser)

usersRoutes.get('/:id',authMiddleware, getUserById) 

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