import { createEvent, createEffect } from "effector-root";
import { getRangByRating } from "../../common/social-rating-ranks";
import { UserModel } from "../../models/user-model";
import { chatRepository } from "../../repositories/chat-repository";

import { AddSocialRating } from "../types";

const increase = createEvent<AddSocialRating>();
const decrease = createEvent<AddSocialRating>();
export const addRatingFx = createEffect<AddSocialRating, void>();
export const getTopUsersByRatingFx = createEffect<
  { chatId: number },
  Array<{ name: string; rank: string; rating: number }> | null
>();

export const socialCredit = {
  increase,
  decrease,
  getTopUsersByRatingFx,
};

export async function getTopUsersByRating({ chatId }: { chatId: number }) {
  try {
    const chat = await chatRepository.getChatByIdFx(chatId);

    if (!chat) return [];

    const users = await UserModel.find({ chat: chat._id }).sort({
      rating: "desc",
    });

    return users
      .filter((user) => user.rating !== 0)
      .map((user) => ({
        name: user.name,
        rank: getRangByRating(user.rating).text,
        rating: user.rating,
      }));
  } catch (error) {}
}
