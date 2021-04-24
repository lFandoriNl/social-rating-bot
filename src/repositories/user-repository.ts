import { createEffect } from "effector-root";

import { Chat, ChatModel } from "../models/chat-model";
import { UserModel, User } from "../models/user-model";

import { UserRequest } from "../services/types";

type UserRequestExtended = UserRequest & { chatId: string; rating: number };

const createUserFx = createEffect<UserRequestExtended, User>();
const getUserByIdFx = createEffect<UserRequestExtended, User | null>();
const getUserByIdOrCreateFx = createEffect<UserRequestExtended, User>();
const getUserByChatId = createEffect<Chat["chatId"], User[] | null>();

createUserFx.use(async (data) => {
  const user = new UserModel({
    userId: data.id,
    name: data.name,
    username: data.username,
    rating: data.rating,
    level: 0,
    chat: data.chatId,
  });
  await user.save();

  return user;
});

getUserByIdFx.use(async (data) => {
  const user = await UserModel.findOne({ userId: data.id, chat: data.chatId });

  return user;
});

getUserByIdOrCreateFx.use(async (data) => {
  const user = await getUserByIdFx(data);

  if (user) return user;

  return await createUserFx(data);
});

getUserByChatId.use(async (chatId) => {
  const chat = await ChatModel.findOne({ chatId });

  if (!chat) return null;

  return await UserModel.find({ chat: chat._id });
});

export const userRepository = {
  createUserFx,
  getUserByIdFx,
  getUserByIdOrCreateFx,
  getUserByChatId,
};
