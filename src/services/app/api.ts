import { createEffect } from "effector";
import { chatApi } from "../chat/chat-service";
import { AddSocialRating } from "../types";

const increaseSocialCreditFx = createEffect<AddSocialRating, void>();
const decreaseSocialCreditFx = createEffect<AddSocialRating, void>();

increaseSocialCreditFx.use(async (data) => {
  const chat = await chatApi.getChatByIdOrCreateFx(data.chat);
});

decreaseSocialCreditFx.use(async (data) => {});

export const app = {
  increaseSocialCreditFx,
  decreaseSocialCreditFx,
};
