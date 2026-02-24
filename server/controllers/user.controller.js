import { User } from "../models/user.model.js";
import {asyncHandler} from "../utils/AsyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const generateAccessAndRefreshToken=async(userId)=>{
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(400,"User not found")
        }
        const accessToken = user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,error.message||"Token Generation Failed")
    }
}

const userRegister = asyncHandler(async (req, res) => {
    const {name, email, password} = req.body;
    if(!name || !email || !password){
        throw new ApiError(400,"All fields are required");
    }
    
    const existedUser = await User.findOne({email})
    if (existedUser) {
        throw new ApiError(400,"User exist with this email please login")
    }


    const user =await User.create({
           name,
           email,
           password
    })

    if (!user) {
        throw new ApiError(400,"Failed to create user")
    }

    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)
    const logedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options={
        httpOnly:true,
        secure:process.env.NODE_ENV==="production",
        sameSite:'strict',
        maxAge:7*24*60*60*1000 // 7 days
    }
    
    return res.status(201)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(
        201,
        {
            user:logedInUser,
            accessToken
        },
        "User Register and logged in Successfully"
    ))
})

export {userRegister}
