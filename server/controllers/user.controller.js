import { User } from "../models/user.model.js";
import {asyncHandler} from "../utils/AsyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
// import { uploadOnCloudinary } from "../utils/cloudinary.js";

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
        throw new ApiError(409,"User exist with this email please login")
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
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const accessOptions={
        httpOnly:true,
        secure:process.env.NODE_ENV==="production",
        sameSite:"strict",
        maxAge:15*60*1000
    }

    const refreshOptions={
        httpOnly:true,
        secure:process.env.NODE_ENV==="production",
        sameSite:'strict',
        maxAge:7*24*60*60*1000 // 7 days
    }
    
    return res.status(201)
    .cookie("accessToken",accessToken,accessOptions)
    .cookie("refreshToken",refreshToken,refreshOptions)
    .json(new ApiResponse(
        201,
        {
            user:loggedInUser
        },
        "User Register and logged in Successfully"
    ))
})

const userLogin = asyncHandler(async(req,res)=>{
    const {email,password}=req.body
    if (!email || !password) {
        throw new ApiError(400,"email and password is required")
    }
    const user = await User.findOne({email})
    if (!user) {
        throw new ApiError(401,"User not found")
    }
    const passwordValidate = await user.isPasswordCorrect(password)
    if (!passwordValidate) {
        throw new ApiError(400,"Invalid Password")
    }
    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findOne(user._id).select("-password -refreshtoken")
    
    const accessOptions = {
        httpOnly:true,
        secure:process.env.NODE_ENV==="production",
        sameSite:"strict",
        maxAge:15*60*1000
    }
    const refreshOptions={
        httpOnly:true,
        secure:process.env.NODE_ENV==="production",
        sameSite:"strict",
        maxAge:7*24*60*60*1000
    }

    return res.status(201)
    .cookie("accessToken",accessToken,accessOptions)
    .cookie("refreshToken",refreshToken,refreshOptions)
    .json(new ApiResponse(
        201,
        loggedInUser,
        "User logged in Successfully"
    ))
})



export {userRegister,userLogin}
