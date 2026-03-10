import {
    upsertTodayStudyLog,
    getTodayStudyLog,
    getUserStudyLogs,
    getLogsByDateRange,
    deleteStudyLog,
    getStudyStats,
    getCalendarHeatmap
} from "../controllers/studylog.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { Router } from "express"

const router = Router();

router.route("/today").post(verifyJWT, upsertTodayStudyLog)
router.route("/today").get(verifyJWT, getTodayStudyLog);
router.route("/user").get(verifyJWT, getUserStudyLogs);
router.route("/range").get(verifyJWT, getLogsByDateRange);
router.route("/:logId").delete(verifyJWT, deleteStudyLog);
router.route("/stats").get(verifyJWT, getStudyStats);
router.route("/calendar").get(verifyJWT, getCalendarHeatmap);

export default router;
