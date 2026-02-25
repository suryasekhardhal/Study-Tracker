import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import crypto from "crypto"
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
    const user = await User.findOne({email}).select("+password")
    if (!user) {
        throw new ApiError(401,"User not found")
    }
    const passwordValidate = await user.isPasswordCorrect(password)
    if (!passwordValidate) {
        throw new ApiError(400,"Invalid Password")
    }
    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    
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

    return res.status(200)
    .cookie("accessToken",accessToken,accessOptions)
    .cookie("refreshToken",refreshToken,refreshOptions)
    .json(new ApiResponse(
        200,
        loggedInUser,
        "User logged in Successfully"
    ))
})

const userLogout = asyncHandler(async(req,res)=>{
    if (!req.user) {
        throw new ApiError(400,"Invalid user")
    }
    // await User.findByIdAndUpdate(
    //     req.user?._id,
    //     {
    //         $set:{
    //             refreshToken:undefined
    //         }
    //     },
    //     {
    //         new:true
    //     }
    // )

    await User.findByIdAndUpdate(req.user._id, {
    $unset: { refreshToken: 1 }
})

    const options = {
        httpOnly:true,
        secure:process.env.NODE_ENV==="production",
        sameSite:"strict"
    }
    return res.status(201)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(
        201,
        null,
        "User loged Out Successfully"
    ))
})

const refreshToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken) {
        throw new ApiError(400,"Invalid refresh Token")
    }
    try {
        const decodedToken = jwt.verify(incomingRefreshToken,REFRESH_TOKEN_SECRET)
        const user = User.findById(decodedToken._id)
        if (!user) {
            throw new ApiError(400,"Invalid refresh token")
        }
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(400,"Refresh token use or expired")
        }
        
        const accessOptions={
            httpOnly:true,
            secure:process.env.NODE_ENV==="production",
            sameSite:"secure",
            maxAge:15*60*1000
        }

        const refreshOptions={
            httpOnly:true,
            secure:process.env.NODE_ENV==="production",
            sameSite:"secure",
            maxAge:7*24*60*60*1000
        }
        const {accessToken,newRefreshToken} = await generateAccessAndRefreshToken(user._id)
        return res.status(200)
        .cookie("accessToken",accessToken,accessOptions)
        .cookie("refreshToken",newRefreshToken,refreshOptions)
        .json(new ApiResponse(
            200,
            "Successfully add access token"
        ))
    } catch (error) {
        throw new ApiError(401,"invalid refresh token")
    }
})

const forgotPassword = asyncHandler(async(req,res)=>{
    const { email } = req.body
    if (!email) {
        throw new ApiError(400,"Email is required")
    }
    const user = await User.findOne({email})
    if (!email) {
        return res.status(200)
        .json(new ApiResponse(
            200,
            null,
            "If the email exists, a reset link has been sent."
        ))
    }
    const resetToken = crypto.randomBytes(32).toString("hex")
    const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex")

    user.passwordResetToken=hashedToken
    user.passwordResetExpires=Date.now() + 15*50*1000
    await user.save({validateBeforeSave:false})
    // TODO: Send email here using nodemailer
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
    console.log("Reset URL:", resetURL);

    return res.status(200)
    .json(new ApiResponse(
        200,
        null,
        "If the email exists, a reset link has been sent."
    ))
    
})

const resetPassword = asyncHandler(async(req,res)=>{
        const {token} = req.params
        const {newPassword}= req.body
        if (!token) {
            throw new ApiError(400, "Invalid reset token")
        }

        if (!newPassword) {
            throw new ApiError(400, "New password is required")
        }

        if (newPassword.length < 6) {
            throw new ApiError(400, "Password must be at least 6 characters")
        }

        const hasedIncomingToken=crypto
        .createHash("sha256")
        .update(token)
        .digest("hex")

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        })

        if (!user) {
            throw new ApiError(400, "Token is invalid or expired")
        }

        user.password = newPassword
        user.passwordResetToken=undefined
        user.passwordResetExpires=undefined
        user.refreshToken=undefined
        await user.save()

        return res.status(200)
        .json(new ApiResponse(
            200,
            null,
            "Password reset successfully. Please login again."
        ))

})

export {userRegister,userLogin,userLogout,refreshToken,forgotPassword,resetPassword}