import connectDB from "./config/db.js";
import { app } from "./app.js";
import dotenv from "dotenv";

dotenv.config({path:'./.env'});

connectDB()
.then(() => {
   app.listen(process.env.PORT, () => {
     console.log(`Server is running on port ${process.env.PORT}`);
   });
})
.catch((error) => {
  console.error("Database connection failed:", error);
});
