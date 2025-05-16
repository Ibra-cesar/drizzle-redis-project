import { NextFunction, Request, Response } from "express";
import { aj } from "../../config/arcjet";

export async function arcJetMiddleware(req: Request, res: Response, next: NextFunction){
    try {
        const trying = await aj.protect(req, {requested: 5})
        if(trying.isDenied()){
            if(trying.reason.isRateLimit()){
                res.writeHead(429, { "content-type": "application/json"});
                res.end(JSON.stringify({error: "Too Many Request."}))
            }else{
                res.writeHead(403, { "content-type": "application/json" });
                res.end(
                  JSON.stringify({ error: "Acces denied." })
                );
            }
        }
        next()
    } catch (error) {
        console.log(`Middleware Error:${error}`)
        next(error)
    }
}