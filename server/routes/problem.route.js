import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addProblem,getUserProblems ,problemStats,deleteProblem} from "../controllers/problem.controller.js";
import { Router } from "express";

const router = Router();

router.route("/add").post(verifyJWT, addProblem);
router.route("/get").get(verifyJWT, getUserProblems);
router.route("/delete/:problemId").delete(verifyJWT, deleteProblem);
router.route("/stats").get(verifyJWT, problemStats);

export default router;
