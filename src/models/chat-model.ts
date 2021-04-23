import * as mongoose from "mongoose";
import { User } from "./user-model";

export interface Chat extends mongoose.Document {
  chatId: number;
  name: string;
  users: User[];
}

const chatSchema = new mongoose.Schema({
  chatId: Number,
  name: String,
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

export const ChatModel: mongoose.Model<Chat> = mongoose.model(
  "Chat",
  chatSchema
);
