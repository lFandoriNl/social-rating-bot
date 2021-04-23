import { createEffect, createEvent } from "effector-root";

import { Message } from "typegram";

import { TG } from "../types";

export const diceRollEvent = createEvent<TG["message"]>();
export const diceRollFx = createEffect<TG["message"], void>();

export const runRouletteEvent = createEvent<TG["message"]>();
export const runRouletteFx = createEffect<TG["message"], void>();

export const rollDiceAndReturnValueFx = createEffect<
  TG["message"],
  [number, Message.DiceMessage]
>();
