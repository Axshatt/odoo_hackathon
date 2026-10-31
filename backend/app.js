import express from "express";
import cors from "cors";
import apiRoutes from "./routes/index.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import { ENV } from "./config/env.js";

const app = express();

app.use(
  cors({
    origin: ENV.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.use("/api", apiRoutes);

app.use(errorHandler);

export default app;

