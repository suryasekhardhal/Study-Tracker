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
            throw new ApiError(409, "Problem already exists");
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

export {addProblem}
