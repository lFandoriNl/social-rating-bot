import {
  removeMessageAfterTimeoutFx,
  removeMessageFx,
  replyToMessageFx,
} from "./index";

import { bot } from "../../bot";
import { scheduler } from "../../common/scheduler";

removeMessageFx.use(async (message) => {
  await bot.telegram.deleteMessage(message.chat.id, message.message_id);
});
removeMessageFx.failData.watch((error) => {
  console.error(error.message);
});

removeMessageAfterTimeoutFx.use(({ message, ms }) => {
  scheduler.createTask({
    task: "removeMessage",
    data: {
      chatId: message.chat.id,
      messageId: message.message_id,
    },
    timeout: ms,
  });
});

replyToMessageFx.use(async ({ message, text, extra = {} }) => {
  return await bot.telegram.sendMessage(message.chat.id, text, {
    reply_to_message_id: message.message_id,
    ...extra,
  });
});
