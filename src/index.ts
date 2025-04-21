import express, { Request, Response } from "express";
import { PORT } from "./config/env";
import authRoutes from "./routes/auth.routes";
import usersRoutes from "./routes/user.routes";
import todosRoutes from "./routes/todos.routes";


const app = express();
const port = PORT;

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/users', usersRoutes)
app.use('/api/v1/todos', todosRoutes)

app.get("/", (req: Request, res: Response) => {
  res.send("Hellooo");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
