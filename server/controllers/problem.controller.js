import { Problem } from "../models/problem.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import {fetchCodeforcesProblem} from "../service/problemFetcher.service.js"

const addProblem = asyncHandler(async (req, res) => {
    const { url } = req.body;
    if (!url) {
        throw new ApiError(400, "URL is required");
    }
    
        const problemData = await fetchCodeforcesProblem(url);

        if (!problemData) {
            throw new ApiError(404, "Problem not found");
        }

        const existedProblem = await Problem.findOne({
            userId: req.user.id,
            platform: problemData.platform,
            problemName: problemData.problemSlug
        });

        if (existedProblem) {
            return res.status(200)
            .json(new ApiResponse(200, null, "Problem already exists"));
        }

        const newProblem = new Problem({
            userId: req.user.id,
            platform: problemData.platform,
            problemName: problemData.problemName,
            problemSlug: problemData.problemSlug,
            difficultyLevel: problemData.difficultyLevel,
            topics: problemData.topics
        });

        await newProblem.save();

        return res.status(200)
        .json(new ApiResponse(200,newProblem, "Problem added successfully"));
    
});

const getUserProblems = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const problems = await Problem.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

    const total = await Problem.countDocuments({ userId: req.user._id });

    return res.status(200)
    .json(new ApiResponse(200, problems, "User problems fetched successfully"));
});

const deleteProblem = asyncHandler(async (req, res) => {
    const { problemId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(problemId)) {
        throw new ApiError(400, "Invalid problem ID");
    }

    const deletedProblem = await Problem.findOneAndDelete({
        _id: problemId,
        userId
    });

    if (!deletedProblem) {
        throw new ApiError(404, "Problem not found or you are not authorized to delete it");
    }

    return res.status(200).json(
        new ApiResponse(200, deletedProblem, "Problem deleted successfully")
    );
});

const problemStats = asyncHandler(async (req, res) => {
    const userId = req.user._id;


    const problemCount = await Problem.countDocuments({ userId });
    const difficultyStats = await Problem.aggregate([
        {
            $match:{userId}
        },
        {
            $group: {
                _id: "$difficultyLevel",
                count: { $sum: 1 }
            }
        }
    ])
    const platformStats = await Problem.aggregate([
        {
            $match: { userId }
        },
        {
            $group: {
                _id: "$platform",
                count: { $sum: 1 }
            }
        }
    ])
    const topicStats = await Problem.aggregate([
        {
            $match: { userId }
        },
        {
            $unwind: "$topics"
        },
        {
            $group: {
                _id: "$topics",
                count: { $sum: 1 }
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(200, {
            problemCount,
            difficultyStats,
            platformStats,
            topicStats
        }, "Problem statistics fetched successfully")
    );
});

export { addProblem, getUserProblems, deleteProblem, problemStats }
