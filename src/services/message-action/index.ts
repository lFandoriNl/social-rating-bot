import { Message } from "typegram";

import { createEffect } from "effector-root";

export const removeMessageFx = createEffect<Message, void>();
export const removeMessageAfterTimeoutFx = createEffect<
  { message: Message; ms: number },
  void
>();
export const replyToMessageFx = createEffect<
  { message: Message; text: string },
  void
>();
