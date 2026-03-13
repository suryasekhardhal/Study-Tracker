import { StudyLog } from "../models/studyLog.model.js";
import { Problem } from "../models/problem.model.js";
import { sendEmail } from "../utils/email.js";

export const generateWeeklyReport = async (user) => {

  const studyLogs = await StudyLog.find({ userId: user._id });

  const problems = await Problem.find({ userId: user._id });

  const totalStudyHours = studyLogs.reduce(
    (sum, log) => sum + log.dsaHours + log.projectHours,
    0
  );

  const totalProblems = problems.length;

  const message = `
DevTrack Weekly Report

Study Hours: ${totalStudyHours}
Problems Solved: ${totalProblems}

Keep pushing your consistency 🚀
`;

  await sendEmail(
    user.email,
    "DevTrack Weekly Productivity Report",
    message
  );
};