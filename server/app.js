import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { apiLimiter} from "./middlewares/rateLimit.middleware.js"; 

import "./cron/weeklyReport.cron.js";
const app = express();

// app.use(cors({origin: process.env.CORS_ORIGIN, credentials: true}));

// ✅ FIXED: Proper CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, etc)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173"
      ];
      
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true, // Allow cookies
    optionsSuccessStatus: 200
  })
);

// Handle preflight requests
app.options("*", cors());

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true, limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser());
app.use("/api/v1", apiLimiter);

import userRouter from "./routes/user.route.js"
import studyLogRouter from "./routes/studyLog.route.js"
import problemRouter from "./routes/problem.route.js"
import analyticsRouter from "./routes/analytics.route.js"

app.use("/api/v1/user", userRouter)
app.use("/api/v1/study-log", studyLogRouter)
app.use("/api/v1/problem", problemRouter)
app.use("/api/v1/analytics", analyticsRouter)

export {app}