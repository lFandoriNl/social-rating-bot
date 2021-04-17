import {
  removeMessageAfterTimeoutFx,
  removeMessageFx,
  replyToMessageFx,
} from "./index";

import { bot } from "../../bot";

removeMessageFx.use(async (message) => {
  await bot.telegram.deleteMessage(message.chat.id, message.message_id);
});
removeMessageFx.failData.watch(console.error);

removeMessageAfterTimeoutFx.use(async ({ message, ms }) => {
  setTimeout(async () => {
    await removeMessageFx(message);
  }, ms);
});
removeMessageAfterTimeoutFx.failData.watch(console.error);

replyToMessageFx.use(async ({ message, text }) => {
  bot.telegram.sendMessage(message.chat.id, text, {
    reply_to_message_id: message.message_id,
  });
});
