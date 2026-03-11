import mongoose,{Schema} from "mongoose";

const problemSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    platform:{
        type:String,
        enum:["LeetCode","HackerRank","CodeSignal","Codewars","Codeforces","AtCoder","InterviewBit","GeeksforGeeks"],
        required:true
    },
    problemName:{
        type:String,
        required:true
    },
    problemSlug:{
        type:String
    },
    difficultyLevel:{
        type:String,
        enum:["Easy","Medium","Hard"],
        required:true
    },
    topics:[{
        type:String,
        // enum:["Arrays","Strings","Trees","Graphs","Dynamic Programming","Backtracking","Greedy"],
        required:true
    }],
    solvedAt:{
        type:Date,
        default:Date.now
    }
},{timestamps:true});

problemSchema.index({ userId: 1, platform: 1, problemName: 1 }, { unique: true });

export const Problem = mongoose.model("Problem",problemSchema);