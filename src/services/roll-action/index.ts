import { createEffect, createEvent } from "effector-root";
import { ExtraDice } from "telegraf/typings/telegram-types";

import { TG } from "../types";

export const diceRollEvent = createEvent<TG["message"]>();
export const diceRollFx = createEffect<TG["message"], void>();

export const runRouletteEvent = createEvent<TG["message"]>();
export const runRouletteFx = createEffect<TG["message"], void>();

export const runCasinoEvent = createEvent<TG["message"]>();
export const runCasinoFx = createEffect<TG["message"], void>();
export const rollDiceCasinoGameFx = createEffect<
  {
    gameId?: string;
    ratingBet: number;
    diceBet: number;
    message: TG["message"];
  },
  void
>();

export const rollDiceAndReturnValueFx = createEffect<
  { message: TG["message"]; extra?: ExtraDice },
  [number, TG["message"]]
>();
