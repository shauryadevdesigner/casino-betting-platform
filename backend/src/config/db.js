import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB() {
  try {
    await mongoose.connect(env.mongoUri);
    console.log("MongoDB connected");
  } catch (err) {
    console.error(
      "\nMongoDB connection failed. Start MongoDB locally or set MONGODB_URI in backend/.env\n" +
        "  Local:  docker compose up -d   (from backend/)\n" +
        "  Atlas:  MONGODB_URI=mongodb+srv://...\n",
    );
    throw err;
  }
}
