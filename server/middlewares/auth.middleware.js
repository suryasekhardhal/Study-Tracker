import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async(req,res)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        if (!token) {
            throw new ApiError(401,"Unauthorized User")
        }
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken._id)
        if (!user) {
            throw new ApiError(400,"Invalid Access Token")
        }
        req.user = user

    } catch (error) {
        throw new ApiError(500,error?.message || "Invalid access token")
        
    }
})

export {verifyJWT}
