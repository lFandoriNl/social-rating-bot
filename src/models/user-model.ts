import * as mongoose from "mongoose";

export interface User extends mongoose.Document {
  userId: number;
  name: string;
  username: string;
  rating: number;
  level: number;
  chat: string;
}

const userSchema = new mongoose.Schema({
  userId: Number,
  name: String,
  username: String,
  rating: Number,
  level: Number,
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
  },
});

export const UserModel: mongoose.Model<User> = mongoose.model(
  "User",
  userSchema
);
