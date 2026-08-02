import "./config/env"; // validates env vars at boot, fails fast if misconfigured
import express, { type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import { errorMiddleware } from "./middlewares/errorMiddleware";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_ORIGIN.split(","),
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

// Baseline rate limit; specific auth routes layer tighter limits on top
// (see middlewares/rateLimiters.ts).
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/auth", userRoutes); // /api/auth/me, /api/auth/me/*

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not found", path: req.originalUrl });
});

app.use(errorMiddleware);

export default app;
