import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI;
  try {
    await mongoose.connect(MONGO_URI);
<<<<<<< HEAD
    console.log("MongoDB connected: learntrack DB");
=======
    console.log("MongoDB connected");
>>>>>>> 3dcaf8113fbb4d94778dc562e219ad6e5ca7d9e3
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};


