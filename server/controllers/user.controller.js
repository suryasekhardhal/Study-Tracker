import { User } from "../models/user.model.js";
import {asyncHandler} from "../utils/AsyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res.status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User fetched succesfully"
    ))
})

const updateProfile = asyncHandler(async(req,res)=>{
    const {name,githubUsername} = req.body
    if (!name || !githubUsername) {
        throw new ApiError(400,"Name or GithubUsername required")
    }
    const {imageLocalUrl}=req.file?.path
    if (!imageLocalUrl) {
        throw new ApiError(400,"ProfileImage file is required")
    }
    const profileImage = await uploadOnCloudinary(image);
    if (!profileImage) {
        throw new ApiError(400,"Failed to upload on cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                name:name,
                githubUsername:githubUsername,
                profilePicture:profileImage.url
            }
        }
    ).select("-password")

    return res.status(200)
    .json(new ApiResponse(
        200,
        user,
        "User profile updated successfully"
    ))


})

const changePassword = asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword} = req.body
    if (!oldPassword || !newPassword) {
        throw new ApiError(400,"OldPassword OR NewPassword is Required")
    }
    if (oldPassword===newPassword) {
        throw new ApiError(400,"New password must be different from old password")
    }
    if (newPassword.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters")
}
    const user = await User.findById(req.user?._id)
    if (!user) {
        throw new ApiError(400,"User not Found")
    }
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect) {
        throw new ApiError(400,"Password is incorrect")
    }
    user.password=newPassword
    user.refreshToken=undefined
    await user.save()
    return res.status(200)
    .json(new ApiResponse(
        200,
        {},
        "Password change successfully"
    ))
})

const deleteAccount = asyncHandler(async(req,res)=>{
    const userId = req.user._id
    if (!userId) {
        throw new ApiError(400,"User ID not Found")
    }
    await User.findByIdAndUpdate(
        userId,
        {
            $set:{
                isDeleted:true,
                refreshToken:undefined
            },
           
        },
        {
                new:true
        }
    )
    return res.status(200)
    .json(new ApiResponse(
        200,
        null,
        "User Account Deleted Successfully"
    ))
})



export {getCurrentUser,updateProfile,changePassword,deleteAccount}
