import * as mongoose from "mongoose";

if (!process.env.MONGO_DB) {
  throw new Error("MONGO_DB is not exist");
}

mongoose.connect(process.env.MONGO_DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.once("open", () => {
  console.log("Connected to db");
});

db.on("error", (error) => {
  console.error("Connection error:", error);
});
