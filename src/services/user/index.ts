import { createEffect } from "effector-root";
import { MessageRating, TG } from "../types";

export const canUserSendRatingFx = createEffect<MessageRating, boolean>();
export const blockUserSendRatingFx = createEffect<TG["message"], void>();
