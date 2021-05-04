import { ExtraReplyMessage } from "telegraf/typings/telegram-types";

import {
  removeMessageAfterTimeoutFx,
  removeMessageFx,
  replyToMessageFx,
} from "./index";

import { bot } from "../../bot";
import { scheduler } from "../../common/scheduler";
import { TG } from "../types";

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

export async function sendMessage(
  message: TG["message"],
  text: string,
  extra?: ExtraReplyMessage
) {
  try {
    return await bot.telegram.sendMessage(message.chat.id, text, extra);
  } catch (error) {}
}

export async function replyToMessage(
  message: TG["message"],
  text: string,
  extra?: ExtraReplyMessage
) {
  try {
    return await bot.telegram.sendMessage(message.chat.id, text, {
      reply_to_message_id: message.message_id,
      ...extra,
    });
  } catch (error) {}
}

export async function removeMessage(message: TG["message"]) {
  try {
    return await bot.telegram.deleteMessage(
      message.chat.id,
      message.message_id
    );
  } catch (error) {
    console.log(error);
  }
}

export function removeMessageAfterTimeout(message: TG["message"], ms: number) {
  scheduler.createTask({
    task: "removeMessage",
    data: {
      chatId: message.chat.id,
      messageId: message.message_id,
    },
    timeout: ms,
  });
}
