// import axios from "axios";
// import * as cheerio from "cheerio";

// export const fetchCodeforcesProblem = async (url) => {

//     const response = await axios.get(url, {
//         headers: {
//             "User-Agent": "Mozilla/5.0",
//             "Accept-Language": "en-US,en;q=0.9"
//         }
//     });

//     const $ = cheerio.load(response.data);

//     const titleText = $(".problem-statement .title").text().trim();

//     const problemName = titleText.split(".")[1]?.trim();

//     const topics = [];

//     $(".tag-box").each((i, el) => {
//         topics.push($(el).text().trim());
//     });

//     const slugParts = url.split("/problem/")[1].split("/");

//     const problemSlug = `${slugParts[0]}-${slugParts[1]}`;

//     return {
//         platform: "Codeforces",
//         problemSlug,
//         problemName,
//         difficultyLevel: "Easy",
//         topics
//     };
// };


import axios from "axios";

export const fetchCodeforcesProblem = async (url) => {

    const parts = url.split("/problem/")[1].split("/");

    const contestId = parts[0];
    const index = parts[1];

    const response = await axios.get(
        "https://codeforces.com/api/problemset.problems"
    );

    const problems = response.data.result.problems;

    const problem = problems.find(
        p => p.contestId == contestId && p.index == index
    );

    if (!problem) {
        throw new Error("Problem not found");
    }

    let difficultyLevel = "Easy";

    if (problem.rating >= 1200 && problem.rating < 1800) {
        difficultyLevel = "Medium";
    }

    if (problem.rating >= 1800) {
        difficultyLevel = "Hard";
    }

    return {
        platform: "Codeforces",
        problemSlug: `${contestId}-${index}`,
        problemName: problem.name,
        difficultyLevel,
        topics: problem.tags
    };
};