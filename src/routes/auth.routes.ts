import { Request, Response, Router } from "express";
import { signIn, signOut, singUp } from "../actions/auth/auth";

const authRoutes = Router();

authRoutes.post('/sign-up', async(req: Request, res: Response) => {
        const result = await singUp(req.body, res);
        res.status(201).json({data: result})
})

authRoutes.post('/sing-in', async(req: Request, res: Response) => {
        const result = await signIn(req.body, res)
        res.status(200).json({mesage: result})
})
authRoutes.post("/sing-out", async(req: Request, res: Response) => {
        const result = await signOut(req, res)
        res.status(200).json({message: result})
});

export default authRoutes;