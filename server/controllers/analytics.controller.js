import mongoose from "mongoose";
import { StudyLog } from "../models/studyLog.model.js";
import { Problem } from "../models/problem.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

const getDashboardAnalytics = asyncHandler(async (req, res) => {

    const userId = req.user._id;

    /*
    -----------------------------------------
    STUDY STATS
    -----------------------------------------
    */

    const studyStats = await StudyLog.aggregate([
        {
            $match: { userId: new mongoose.Types.ObjectId(userId) }
        },
        {
            $group: {
                _id: null,
                totalDSAHours: { $sum: "$dsaHours" },
                totalProjectHours: { $sum: "$projectHours" },
                totalProblemsSolved: { $sum: "$problemsSolved" },
                totalStudyDays: { $sum: 1 }
            }
        }
    ]);

    /*
    -----------------------------------------
    PROBLEM DIFFICULTY STATS
    -----------------------------------------
    */

    const difficultyStats = await Problem.aggregate([
        {
            $match: { userId: new mongoose.Types.ObjectId(userId) }
        },
        {
            $group: {
                _id: "$difficultyLevel",
                count: { $sum: 1 }
            }
        }
    ]);

    /*
    -----------------------------------------
    TOPIC STATS
    -----------------------------------------
    */

    const topicStats = await Problem.aggregate([
        {
            $match: { userId: new mongoose.Types.ObjectId(userId) }
        },
        { $unwind: "$topics" },
        {
            $group: {
                _id: "$topics",
                count: { $sum: 1 }
            }
        }
    ]);

    /*
    -----------------------------------------
    TOTAL PROBLEMS
    -----------------------------------------
    */

    const totalProblems = await Problem.countDocuments({ userId });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                studyStats: studyStats[0] || {},
                difficultyStats,
                topicStats,
                totalProblems
            },
            "Dashboard analytics fetched successfully"
        )
    );
});

export { getDashboardAnalytics };