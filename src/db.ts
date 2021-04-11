import * as mongoose from "mongoose";

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
