
import mongoose from "mongoose";
import { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true
    },
    password:{
        type: String,
        required: true,
        select: false
    },
    streak:{
        type: Number,
        default: 0
    },
    longestStreak: {
        type: Number,
        default: 0
    },
    totalHours:{
        type: Number,
        default: 0
    },
    totalProblems: {
        type: Number,
        default: 0
    },
    planType: {
        type: String,
        enum: ["free", "premium"],
        default: "free"
    },
    githubUsername: {
        type: String,
        trim: true
    },
    profilePicture: {
        type: String,
        trim: true,
        default:""
    },
    refreshToken: {
        type: String,
        trim: true
    }
},{timestamps: true});

userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return ;
        this.password = await bcrypt.hash(this.password, 10);
   
    ;
});

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
          {
            _id: this._id,
            email: this.email,
          },
          process.env.ACCESS_TOKEN_SECRET,
          {
              expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "1d"
          }

    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
          {
            _id: this._id,
            email: this.email,
          },
          process.env.REFRESH_TOKEN_SECRET,
          {
              expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d"
          }

    )
}

export const User = mongoose.model("User", userSchema);