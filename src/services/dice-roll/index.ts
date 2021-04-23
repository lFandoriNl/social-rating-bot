import { createEffect, createEvent } from "effector";

import { TG } from "../types";

export const diceRollEvent = createEvent<TG["message"]>();

export const sendDiceRollEventFx = createEffect<TG["message"], void>();
