import { createEffect } from "effector-root";

import { ChatModel, Chat } from "../models/chat-model";
import { ChatRequest } from "../services/types";

const createChatFx = createEffect<ChatRequest, Chat>();
const getChatByIdFx = createEffect<number, Chat | null>();
const getChatByIdOrCreateFx = createEffect<ChatRequest, Chat>();

createChatFx.use(async (data) => {
  const chat = new ChatModel({ chatId: data.id, name: data.name });
  await chat.save();

  return chat;
});

getChatByIdFx.use(async (chatId) => {
  const chat = await ChatModel.findOne({ chatId });

  return chat;
});

getChatByIdOrCreateFx.use(async (data) => {
  const chat = await getChatByIdFx(data.id);

  if (chat) return chat;

  return await createChatFx(data);
});

export const chatRepository = {
  createChatFx,
  getChatByIdFx,
  getChatByIdOrCreateFx,
};

// const createChatFx = createEffect<ChatRequest, Chat>();
// const getChatByIdFx = createEffect<ChatRequest, Chat | null>();
// const getChatByIdOrCreateFx = createEffect<ChatRequest, Chat | null>();

// createChatFx.use(async (data) => {
//   const chat = new ChatModel({ chatId: data.id, name: data.name });
//   await chat.save();

//   return chat;
// });

// getChatByIdFx.use(async (data) => {
//   const chat = await ChatModel.findOne({ chatId: data.id });

//   return chat;
// });

// getChatByIdOrCreateFx.use(async (data) => {
//   const chat = await getChatByIdFx(data);

//   if (chat) return chat;

//   return await createChatFx(data);
// });

// export const chatRepository = {
//   createChatFx,
//   getChatByIdFx,
//   getChatByIdOrCreateFx,
// };
