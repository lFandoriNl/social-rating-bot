import { createEffect } from "effector-root";

import { MessageModel, Message } from "../models/message-model";
import { MessageRequest } from "../services/types";

type MessageRequestExtended = MessageRequest & {
  chatId: string;
} & { type: "increase" | "decrease" };

const createMessageFx = createEffect<MessageRequestExtended, Message>();
const getMessageByIdFx = createEffect<MessageRequestExtended, Message | null>();

createMessageFx.use(async (data) => {
  const message = new MessageModel({
    messageId: data.id,
    date: data.date,
    increased: data.type === "increase",
    decreased: data.type === "decrease",
    chat: data.chatId,
  });
  await message.save();

  return message;
});

getMessageByIdFx.use(async (data) => {
  const message = await MessageModel.findOne({
    messageId: data.id,
    chat: data.chatId,
  });

  return message;
});

export const messageRepository = {
  createMessageFx,
  getMessageByIdFx,
};
