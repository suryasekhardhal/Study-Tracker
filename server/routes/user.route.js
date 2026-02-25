import {
    getCurrentUser,updateProfile,
    changePassword,deleteAccount
} from "../controllers/user.controller.js"
import {userRegister,userLogin,userLogout,refreshToken,resetPassword,forgotPassword} from "../controllers/auth.controller.js"
import { Router } from "express"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import{upload} from "../middlewares/multer.middleware.js"

const router = Router();
//public routes
router.route("/register").post(userRegister)
router.route("/login").post(userLogin)
router.route("/refresh-token").post(refreshToken)
router.route("/forgot-password").post(forgotPassword)
router.route("/reset-password/:token").post(resetPassword)
//secure routes
router.route("/logout").post(verifyJWT,userLogout)
router.route("/me").get(verifyJWT,getCurrentUser)
router.route("/update-profile").put(
    verifyJWT,
    upload.single("profilePicture"),
    updateProfile
)
router.route("/change-password").patch(verifyJWT,changePassword)
router.route("/delete-account").delete(verifyJWT,deleteAccount)


export default router