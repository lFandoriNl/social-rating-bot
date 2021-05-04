import { forward } from "effector-root";
import { getRangByRating } from "../../common/social-rating-ranks";
import { UserModel } from "../../models/user-model";
import { chatRepository } from "../../repositories/chat-repository";
import { messageRepository } from "../../repositories/message-repository";
import { userRepository } from "../../repositories/user-repository";
import { socialCredit, addRatingFx, getTopUsersByRatingFx } from "./index";

forward({
  from: [socialCredit.increase, socialCredit.decrease],
  to: addRatingFx,
});

addRatingFx.use(async (data) => {
  console.log(data.chat.name, data.user.name, data.type);

  const chat = await chatRepository.getChatByIdOrCreateFx(data.chat);

  const message = await messageRepository.getMessageByIdFx({
    ...data.replyToMessage,
    type: data.type,
    chatId: chat._id,
  });

  if (!message) {
    await messageRepository.createMessageFx({
      id: data.replyToMessage.id,
      date: data.replyToMessage.date * 1000,
      type: data.type,
      chatId: chat._id,
    });
  }

  if (message) {
    if (data.type === "increase" && message.increased) {
      return;
    }

    if (data.type === "increase" && message.decreased) {
      await message.updateOne({
        increased: true,
      });
    }

    if (data.type === "decrease" && message.decreased) {
      return;
    }

    if (data.type === "decrease" && message.increased) {
      await message.updateOne({
        decreased: true,
      });
    }
  }

  const rating = data.type === "increase" ? 20 : -20;

  const user = await userRepository.getUserByIdOrCreateFx({
    ...data.user,
    chatId: chat._id,
    rating: 0,
    dateLastRating: data.user.dateLastRating,
  });

  await user.updateOne({
    name: data.user.name,
    username: data.user.username,
    rating: user.rating + rating,
    dateLastRating: data.user.dateLastRating,
  });
});

getTopUsersByRatingFx.use(async ({ chatId }) => {
  const chat = await chatRepository.getChatByIdFx(chatId);

  if (!chat) return [];

  const users = await UserModel.find({ chat: chat._id }).sort({
    rating: "desc",
  });

  return users
    .filter((user) => user.rating !== 0)
    .map((user) => ({
      name: user.name,
      rank: getRangByRating(user.rating).text,
      rating: user.rating,
    }));
});
