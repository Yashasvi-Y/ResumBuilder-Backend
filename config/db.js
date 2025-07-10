import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ DB CONNECTED");
  } catch (error) {
    console.error("❌ DB CONNECTION FAILED:", error.message);
    process.exit(1); // optional: exit on failure
  }
};
