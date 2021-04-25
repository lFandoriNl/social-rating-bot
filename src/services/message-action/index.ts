import { Message } from "typegram";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";

import { createEffect } from "effector-root";
import { TG } from "../types";

export const removeMessageFx = createEffect<Message, void>();
export const removeMessageAfterTimeoutFx = createEffect<
  { message: Message; ms: number },
  void
>();
export const replyToMessageFx = createEffect<
  { message: TG["message"]; text: string; extra?: ExtraReplyMessage },
  Message.TextMessage
>();
