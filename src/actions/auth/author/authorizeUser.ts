import { NextFunction, Request, Response } from "express";
import { db } from "../../../drizzle/db";
import { eq } from "drizzle-orm";
import { userTable } from "../../../drizzle/schema";

export async function getUser(req:Request, res:Response, next: NextFunction) {
    try {
        const users = await db.query.userTable.findMany()
        res.status(200).json({succes: true, data: users})
        next()
    } catch (error) {
        const errorMessage = new Error("No available users.")
        res.status(401).json({message: errorMessage, error})
        throw errorMessage
    }
}

export async function getUserById(req: Request, res: Response, next: NextFunction){
    try {
        const userId = req.params.id
        if(!userId){
            const error = new Error("Missing User Id.")
            res.status(401).json({message: error})
            throw error
        }
        const user = await db.query.userTable.findFirst({
            columns:{
                id: true,
                email:true,
                name:true,
                createdAt: true,
            },
            where: eq(userTable.id, userId)
        })

        if(!user){
            const error = new Error("User is not found.");
            res.status(401).json({ message: error });
            throw error;
        }
        res.status(200).json(user)
    } catch (error) {
        const errorMessage = new Error("Internal server error.");
        res.status(500).json({ message: errorMessage, error });
        throw error;
        next(error)
    }
}