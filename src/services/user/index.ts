import { createEffect } from "effector-root";

import { MessageRating, TG } from "../types";

export const canUserSendRatingFx = createEffect<MessageRating, boolean>();
export const blockUserSendRatingFx = createEffect<TG["message"], void>();

export const canUserSendCasinoFx = createEffect<
  TG["message"],
  {
    canSendCasino: boolean;
    hasUser: boolean;
  }
>();
export const blockUserSendCasinoFx = createEffect<TG["message"], void>();

export const checkHasCasinoGame = createEffect<
  TG["message"],
  { gameId?: string; message: TG["message"] }
>();
