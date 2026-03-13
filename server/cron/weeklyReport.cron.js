import cron from "node-cron";
import { User } from "../models/user.model.js";
import { generateWeeklyReport } from "../service/weeklyReport.service.js";

cron.schedule("0 9 * * 1", async () => {

  console.log("Running weekly report job...");

  const users = await User.find();

  for (const user of users) {
    await generateWeeklyReport(user);
  }

});