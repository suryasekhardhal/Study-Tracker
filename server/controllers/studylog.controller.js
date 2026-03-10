import mongoose from "mongoose";
import { StudyLog } from "../models/studyLog.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";



/*
-----------------------------------------
UPSERT TODAY STUDY LOG
-----------------------------------------
*/

const upsertTodayStudyLog = asyncHandler(async (req, res) => {

    const { dsaHours, projectHours, problemsSolved, topics, notes } = req.body;

    const userId = req.user._id;

    const now = new Date();

    const startOfDay = new Date(now.setHours(0,0,0,0));
    const endOfDay = new Date(now.setHours(23,59,59,999));

    const log = await StudyLog.findOneAndUpdate(
        {
            userId,
            date: { $gte: startOfDay, $lte: endOfDay }
        },
        {
            $set: {
                dsaHours,
                projectHours,
                problemsSolved,
                topics,
                notes,
                date: new Date()
            }
        },
        {
            new: true,
            upsert: true
        }
    );

    return res.status(200).json(
        new ApiResponse(200, log, "Today's study log saved successfully")
    );
});



/*
-----------------------------------------
 GET TODAY LOG
-----------------------------------------
*/

const getTodayStudyLog = asyncHandler(async (req, res) => {

    const userId = req.user._id;

    const now = new Date();

    const startOfDay = new Date(now.setHours(0,0,0,0));
    const endOfDay = new Date(now.setHours(23,59,59,999));

    const log = await StudyLog.findOne({
        userId,
        date: { $gte: startOfDay, $lte: endOfDay }
    });

    return res.status(200).json(
        new ApiResponse(200, log, "Today's study log fetched")
    );
});



/*
-----------------------------------------
 GET ALL USER LOGS
-----------------------------------------
*/

const getUserStudyLogs = asyncHandler(async (req, res) => {

    const userId = req.user._id;

    const logs = await StudyLog.find({ userId })
        .sort({ date: -1 });

    return res.status(200).json(
        new ApiResponse(200, logs, "Study logs fetched successfully")
    );
});



/*
-----------------------------------------
 GET LOGS BY DATE RANGE
-----------------------------------------
*/

const getLogsByDateRange = asyncHandler(async (req, res) => {

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        throw new ApiError(400, "Start date and end date required");
    }

    const userId = req.user._id;

    const logs = await StudyLog.find({
        userId,
        date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        }
    }).sort({ date: -1 });

    return res.status(200).json(
        new ApiResponse(200, logs, "Logs fetched successfully")
    );
});



/*
-----------------------------------------
 DELETE STUDY LOG
-----------------------------------------
*/

const deleteStudyLog = asyncHandler(async (req, res) => {

    const { logId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(logId)) {
        throw new ApiError(400, "Invalid log ID");
    }

    const deletedLog = await StudyLog.findByIdAndDelete(logId);

    if (!deletedLog) {
        throw new ApiError(404, "Study log not found");
    }

    return res.status(200).json(
        new ApiResponse(200, deletedLog, "Study log deleted")
    );
});



/*
-----------------------------------------
 STUDY STATISTICS (Dashboard)
-----------------------------------------
*/

const getStudyStats = asyncHandler(async (req, res) => {

    const userId = req.user._id;

    const stats = await StudyLog.aggregate([
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

    return res.status(200).json(
        new ApiResponse(200, stats[0], "Study statistics fetched")
    );
});



/*
-----------------------------------------
 CALENDAR HEATMAP DATA
-----------------------------------------
*/

const getCalendarHeatmap = asyncHandler(async (req, res) => {

    const userId = req.user._id;

    const logs = await StudyLog.find(
        { userId },
        { date: 1, dsaHours: 1, projectHours: 1 }
    );

    const calendar = logs.map(log => ({
        date: log.date,
        intensity: log.dsaHours + log.projectHours
    }));

    return res.status(200).json(
        new ApiResponse(200, calendar, "Calendar data fetched")
    );
});

const getStudyStreak = asyncHandler(async (req, res) => {

    const userId = req.user._id;

    const logs = await StudyLog.find({ userId })
        .sort({ date: 1 })
        .select("date");

    if (!logs.length) {
        return res.status(200).json(
            new ApiResponse(200, {
                currentStreak: 0,
                longestStreak: 0
            }, "No study logs yet")
        );
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    for (let i = 1; i < logs.length; i++) {

        const prev = new Date(logs[i - 1].date);
        const curr = new Date(logs[i].date);

        const diff =
            (curr - prev) / (1000 * 60 * 60 * 24);

        if (diff === 1) {
            tempStreak++;
        } else {
            tempStreak = 1;
        }

        longestStreak = Math.max(longestStreak, tempStreak);
    }

    const today = new Date();
    const lastLog = new Date(logs[logs.length - 1].date);

    const diffFromToday =
        Math.floor((today - lastLog) / (1000 * 60 * 60 * 24));

    currentStreak = diffFromToday <= 1 ? tempStreak : 0;

    return res.status(200).json(
        new ApiResponse(200, {
            currentStreak,
            longestStreak
        }, "Study streak fetched")
    );
});



export {
    upsertTodayStudyLog,
    getTodayStudyLog,
    getUserStudyLogs,
    getLogsByDateRange,
    deleteStudyLog,
    getStudyStats,
    getCalendarHeatmap,
    getStudyStreak
};