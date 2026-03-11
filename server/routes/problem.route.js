import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addProblem,getUserProblems } from "../controllers/problem.controller.js";
import { Router } from "express";

const router = Router();

router.route("/add").post(verifyJWT, addProblem);
router.route("/get").get(verifyJWT, getUserProblems);

export default router;
