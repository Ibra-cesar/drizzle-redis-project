import { Request, Response, Router } from "express";
import { singUp } from "../actions/auth/auth";

const authRoutes = Router();

authRoutes.post('/sing-up', async(req: Request, res: Response) => {
    try {
        const result = await singUp(req.body, res);
        res.status(201).json({message: result})
    } catch (error) {
        console.error(error)
        res.status(401).json({message: "Unable to create user."})
    }
})

authRoutes.post('/sing-in', (req: Request, res: Response) => {
    res.send({message: "SIGN-IN"}) 
})
authRoutes.post('/sing-out', (req: Request, res: Response) => {
    res.send({message: "SIGN-OUT"})
})

export default authRoutes;