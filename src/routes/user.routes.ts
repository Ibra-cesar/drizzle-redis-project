import { Request, Response, Router } from "express";
import { getUser, getUserById } from "../actions/auth/author/authorizeUser";
import { authMiddleware } from "../actions/middleware/authMiddleware";
import { arcJetMiddleware } from "../actions/middleware/ajMiddleware";

const usersRoutes = Router()

usersRoutes.get('/',authMiddleware, getUser, arcJetMiddleware)

usersRoutes.get('/:id',authMiddleware, getUserById, arcJetMiddleware) 

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