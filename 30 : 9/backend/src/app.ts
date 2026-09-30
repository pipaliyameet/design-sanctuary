import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { authenticate } from "./middleware/auth.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import publicRoutes from "./routes/public.routes.js";
import projectRoutes from "./routes/project.routes.js";
import clientRoutes from "./routes/client.routes.js";
import leadRoutes from "./routes/lead.routes.js";
import mediaRoutes from "./routes/media.routes.js";
import financeRoutes from "./routes/finance.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import portalRoutes from "./routes/portal.routes.js";
import materialRoutes from "./routes/material.routes.js";
import vendorRoutes from "./routes/vendor.routes.js";
import teamRoutes from "./routes/team.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import { settingsRouter, activityRouter } from "./routes/settings.routes.js";

const app = express();

// 1. Basic security & logging
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  }),
);

const allowedOrigins = [
  env.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in development
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// 2. Authentication extraction
app.use(authenticate);

// 3. API Router
const apiRouter = express.Router();

apiRouter.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Interior Studio Platform Backend API is running smoothly",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

apiRouter.use("/auth", authRoutes);
apiRouter.use("/public", publicRoutes);
apiRouter.use("/projects", projectRoutes);
apiRouter.use("/clients", clientRoutes);
apiRouter.use("/leads", leadRoutes);
apiRouter.use("/media", mediaRoutes);
apiRouter.use("/finance", financeRoutes);
apiRouter.use("/dashboard", dashboardRoutes);
apiRouter.use("/portal", portalRoutes);
apiRouter.use("/materials", materialRoutes);
apiRouter.use("/vendors", vendorRoutes);
apiRouter.use("/team", teamRoutes);
apiRouter.use("/notifications", notificationRoutes);
apiRouter.use("/activity", activityRouter);
apiRouter.use("/settings", settingsRouter);

// Mount router on both /api and / for maximum serverless compatibility
app.use("/api", apiRouter);
app.use("/", apiRouter);

// 5. 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Requested API endpoint not found",
    code: "NOT_FOUND",
  });
});

// 6. Global Error Handler
app.use(errorHandler);

export default app;
