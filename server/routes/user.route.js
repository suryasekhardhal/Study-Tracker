import {userRegister} from "../controllers/user.controller.js"
import { Router } from "express"

const router = Router();

router.route("/register").post(userRegister)

export default router