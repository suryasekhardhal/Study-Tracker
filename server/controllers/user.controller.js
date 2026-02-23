import { User } from "../models/user.model.js";
import {asyncHandler} from "../utils/AsyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const userRegister = asyncHandler(async (req, res) => {
    const {name, email, password, githubUsername} = req.body;
    if(!name || !email || !password){
        throw new ApiError("All fields are required", 400);
    }
    const {image} = req.files;
    if(!image){
        throw new ApiError("Image is required", 400);
    }
    
})
