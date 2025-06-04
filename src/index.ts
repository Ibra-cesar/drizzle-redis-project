import express from "express";
import { APP_PORT } from "./config/env";
import authRoutes from "./routes/auth.routes";
import usersRoutes from "./routes/user.routes";
import cookieParser from "cookie-parser";
import recipesRoutes from "./routes/recipe.routes";
import { monitoringRoutes } from "./routes/monitoring.routes";
import cors from "cors"

const app = express();
const port = APP_PORT;

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
  credentials: true
}))

app.use(cookieParser())
app.use(express.json())

app.use('/api/v1/auth', authRoutes )
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/recipes", recipesRoutes);
app.use(monitoringRoutes)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
