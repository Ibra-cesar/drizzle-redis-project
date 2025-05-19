import express, { Request, Response } from "express";
import { APP_PORT } from "./config/env";
import authRoutes from "./routes/auth.routes";
import usersRoutes from "./routes/user.routes";
import cookieParser from "cookie-parser";
import recipesRoutes from "./routes/recipe.routes";
import { authMiddleware } from "./actions/middleware/authMiddleware";

const app = express();
const port = APP_PORT;

app.use(cookieParser())
app.use(express.json())

app.use('/api/v1/auth', authRoutes )
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/recipes", recipesRoutes, authMiddleware);

app.get("/", (req: Request, res: Response) => {
  res.send("Hellooo");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
