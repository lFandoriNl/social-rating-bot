import { createEffect } from "effector";

import { bot } from "../../bot";

import { TG } from "../types";

export const removeMessageFx = createEffect<TG["message"], void>();
export const removeMessageAfterTimeoutFx = createEffect<TG["message"], void>();

removeMessageFx.use(async (message) => {
  await bot.telegram.deleteMessage(message.chat.id, message.message_id);
});

removeMessageAfterTimeoutFx.use(async (message) => {
  setTimeout(async () => {
    await removeMessageFx(message);
  }, 5 * 60 * 1000);
});

removeMessageFx.failData.watch(console.error);
removeMessageAfterTimeoutFx.failData.watch(console.error);
