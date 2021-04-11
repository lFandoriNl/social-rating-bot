import * as mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  chatId: Number,
  name: String,
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

export const ChatModel = mongoose.model("Chat", chatSchema);
