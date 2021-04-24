import { createEffect } from "effector-root";

import { TG } from "../types";

export const canChatSendRouletteFx = createEffect<TG["message"], boolean>();
export const blockChatSendRouletteFx = createEffect<TG["message"], void>();
