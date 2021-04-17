import { Update } from "typegram";

export type TG = {
  message: Update.MessageUpdate["message"];
};

export type ChatRequest = { id: number; name: string };
export type UserRequest = { id: number; name: string };

export type AddSocialRating = {
  chat: ChatRequest;
  user: UserRequest;
  replyToMessage: { id: number; date: number };
};
