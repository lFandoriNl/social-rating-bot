import { createEffect, forward } from "effector";
import { chatRepository } from "../../repositories/chat-repository";
import { socialCredit, addRatingFx } from "./index";

forward({
  from: [socialCredit.increase, socialCredit.decrease],
  to: addRatingFx,
});

addRatingFx.use(async (data) => {
  console.log(data);
  const chat = await chatRepository.getChatByIdOrCreateFx(data.chat);
});
