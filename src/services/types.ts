import { Update } from "typegram";

export type TG = {
  message: Update.MessageUpdate["message"];
};

export type MessageRating = {
  type: "increase" | "decrease";
  message: TG["message"];
};

export type ChatRequest = { id: number; name: string };
export type UserRequest = { id: number; name: string };
export type MessageRequest = { id: number; date: number };

export type AddSocialRating = {
  type: "increase" | "decrease";
  chat: ChatRequest;
  user: UserRequest;
  replyToMessage: MessageRequest;
};
