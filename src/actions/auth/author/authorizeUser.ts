import { NextFunction, Request, Response } from "express";
import { db } from "../../../drizzle/db";
import { eq } from "drizzle-orm";
import { userTable } from "../../../drizzle/schema";

export async function getUser(req: Request, res:Response, next: NextFunction) {
    try {
        const users = await db.query.userTable.findMany()
        res.status(200).json({succes: true, data: users})
    } catch (error) {
        res.status(404).json({message: "No available user found.", error})
        next(error)
    }
}

export async function getUserById(req: Request, res: Response, next: NextFunction):Promise<void>{
    try {
        const { id } = req.params
        if(!id){
            res.status(401).json({message: "User Id is Missing."})
            return;
        }
        const user = await db.query.userTable.findFirst({
            columns:{
                id: true,
                email:true,
                name:true,
                createdAt: true,
            },
            where: eq(userTable.id, id)
        })

        if(!user){
            res.status(401).json({ message: "User Not Found." });
            return;
        }
        res.status(200).json({succes: true, data: user})
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error.", error });
        next(error)
        return;
    }
}