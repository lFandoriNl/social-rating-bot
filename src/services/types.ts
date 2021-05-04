import { IncomingMessage } from "telegraf/typings/telegram-types";

export type TG = {
  message: IncomingMessage;
};

export type MessageRating = {
  type: "increase" | "decrease";
  message: IncomingMessage;
};

export type ChatRequest = { id: number; name: string };
export type UserRequest = {
  id: number;
  name: string;
  username: string;
  dateLastRating: Date;
};
export type MessageRequest = { id: number; date: number };

export type AddSocialRating = {
  type: "increase" | "decrease";
  chat: ChatRequest;
  user: UserRequest;
  replyToMessage: MessageRequest;
};
