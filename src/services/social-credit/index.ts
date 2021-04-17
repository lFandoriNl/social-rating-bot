import { createEvent, createEffect } from "effector-root";
import { User } from "../../models/user-model";

import { AddSocialRating } from "../types";

const increase = createEvent<AddSocialRating>();
const decrease = createEvent<AddSocialRating>();
export const addRatingFx = createEffect<AddSocialRating, void>();
export const getTopUsersByRatingFx = createEffect<
  { chatId: number },
  User[] | null
>();

export const socialCredit = {
  increase,
  decrease,
  getTopUsersByRatingFx,
};
