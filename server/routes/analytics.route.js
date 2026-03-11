import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getDashboardAnalytics } from "../controllers/analytics.controller.js";

const router = Router();

//router.get("/dashboard", verifyJWT, getDashboardAnalytics);
router.route("/dashboard").get(verifyJWT, getDashboardAnalytics);

export default router;