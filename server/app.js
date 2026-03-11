import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { apiLimiter} from "./middlewares/rateLimit.middleware.js"; 
const app = express();

app.use(cors({origin: process.env.CORS_ORIGIN, credentials: true}));
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