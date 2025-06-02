import { Request } from "express";

export interface AuthMiddleware extends Request{
    user?:{
        id: string;
        email: string;
        name: string
    }
}