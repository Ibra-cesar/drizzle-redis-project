import { Request, Response, Router } from "express";

const authRoutes = Router();

authRoutes.post('/sing-up', (req: Request, res: Response) => {
    res.send({message: "SIGN-UP"})
})
authRoutes.post('/sing-in', (req: Request, res: Response) => {
    res.send({message: "SIGN-IN"})
})
authRoutes.post('/sing-out', (req: Request, res: Response) => {
    res.send({message: "SIGN-OUT"})
})

export default authRoutes;