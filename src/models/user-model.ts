import * as mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userId: Number,
  name: String,
  socialCredit: Number,
  level: Number,
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
  },
});

export const UserModel = mongoose.model("User", userSchema);
