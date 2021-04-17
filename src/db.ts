import * as mongoose from "mongoose";

export async function connectDB() {
  try {
    if (!process.env.MONGO_DB) {
      throw new Error("MONGO_DB is not exist");
    }

    mongoose.connect(process.env.MONGO_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to db");
  } catch (error) {
    console.error("Connection error:", error);
  }
}
