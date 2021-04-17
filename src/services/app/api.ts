import { createEffect } from "effector";
import { chatRepository } from "../../repositories/chat-repository";
import { AddSocialRating } from "../types";

const increaseSocialCreditFx = createEffect<AddSocialRating, void>();
const decreaseSocialCreditFx = createEffect<AddSocialRating, void>();

increaseSocialCreditFx.use(async (data) => {
  const chat = await chatRepository.getChatByIdOrCreateFx(data.chat);
});

decreaseSocialCreditFx.use(async (data) => {});

export const app = {
  increaseSocialCreditFx,
  decreaseSocialCreditFx,
};
