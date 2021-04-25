import { createEvent, createEffect } from "effector-root";

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
