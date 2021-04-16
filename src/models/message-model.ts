import * as mongoose from "mongoose";

export interface Message extends mongoose.Document {
  messageId: number;
  date: number;
  increased: boolean;
  decreased: boolean;
  chat: string;
}

const messageSchema = new mongoose.Schema({
  messageId: Number,
  date: Number,
  increased: { type: Boolean, default: false },
  decreased: { type: Boolean, default: false },
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
  },
});

export const MessageModel: mongoose.Model<Message> = mongoose.model(
  "Message",
  messageSchema
);
