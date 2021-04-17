import { createEvent, createEffect } from "effector";

import { AddSocialRating } from "../types";

const increase = createEvent<AddSocialRating>();
const decrease = createEvent<AddSocialRating>();
export const addRatingFx = createEffect<AddSocialRating, void>();

export const socialCredit = {
  increase,
  decrease,
};
