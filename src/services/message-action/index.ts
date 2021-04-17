import { createEffect } from "effector-root";

import { TG } from "../types";

export const removeMessageFx = createEffect<TG["message"], void>();
export const removeMessageAfterTimeoutFx = createEffect<
  { message: TG["message"]; ms: number },
  void
>();
export const replyToMessageFx = createEffect<
  { message: TG["message"]; text: string },
  void
>();
