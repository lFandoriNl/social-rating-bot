import {
  removeMessageAfterTimeoutFx,
  removeMessageFx,
  replyToMessageFx,
} from "./index";

import { bot } from "../../bot";

removeMessageFx.use(async (message) => {
  await bot.telegram.deleteMessage(message.chat.id, message.message_id);
});
removeMessageFx.failData.watch((error) => {
  console.error(error.message);
});

removeMessageAfterTimeoutFx.use(async ({ message, ms }) => {
  const removeMessageAfterTimeout = async () =>
    new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          resolve(
            await bot.telegram.deleteMessage(
              message.chat.id,
              message.message_id
            )
          );
        } catch (error) {
          reject(error);
        }
      }, ms);
    });

  await removeMessageAfterTimeout();
});
removeMessageAfterTimeoutFx.failData.watch((error) => {
  console.error(error.message);
});

replyToMessageFx.use(async ({ message, text }) => {
  bot.telegram.sendMessage(message.chat.id, text, {
    reply_to_message_id: message.message_id,
  });
});
