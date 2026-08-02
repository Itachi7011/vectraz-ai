import "./config/env"; // validates env vars at boot
import express, { type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import newsRoutes from "./routes/newsRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import preferencesRoutes from "./routes/preferencesRoutes";
import subscriptionRoutes from "./routes/subscriptionRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import adminRoutes from "./routes/adminRoutes";
import { errorMiddleware } from "./middlewares/errorMiddleware";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_ORIGIN.split(","),
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 600,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ service: "main-service", status: "ok", time: new Date().toISOString() });
});

app.use("/api/news", newsRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/preferences", preferencesRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not found", path: req.originalUrl });
});

app.use(errorMiddleware);

export default app;
