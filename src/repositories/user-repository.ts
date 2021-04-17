import { createEffect } from "effector-root";

import { UserModel, User } from "../models/user-model";
import { UserRequest } from "../services/types";

type UserRequestExtended = UserRequest & { chatId: string; rating: number };

const createUserFx = createEffect<UserRequestExtended, User>();
const getUserByIdFx = createEffect<UserRequestExtended, User | null>();
const getUserByIdOrCreateFx = createEffect<UserRequestExtended, User>();

createUserFx.use(async (data) => {
  const user = new UserModel({
    userId: data.id,
    name: data.name,
    socialCredit: data.rating,
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

export const userRepository = {
  createUserFx,
  getUserByIdFx,
  getUserByIdOrCreateFx,
};
