import { forward, guard, split, merge, sample, combine } from "effector-root";

import { socialCredit } from "../social-credit";

import { blockUserSendRatingFx, canUserSendRatingFx } from "../user";

import {
  removeMessageAfterTimeoutFx,
  removeMessageFx,
  replyToMessageFx,
} from "../message-action";

import {
  commandRateReply,
  commandUnRateReply,
  commandRateNoReply,
} from "../command-rate";

import {
  messageStickerSocialReply,
  messageStickerSocialNoReply,
  messageSocialToUser,
} from "./index";

import { REMOVE_RATING_MESSAGE } from "../../constants/timeouts";

import { AddSocialRating, MessageRating, TG } from "../types";

forward({
  from: merge([
    messageStickerSocialNoReply,
    commandRateNoReply.map((message) => ({ message })),
  ]),
  to: removeMessageFx.prepend(({ message }) => message),
});

const sendRatingReply = merge([
  messageStickerSocialReply,
  commandRateReply,
  commandUnRateReply,
]);

forward({
  from: sendRatingReply,
  to: canUserSendRatingFx,
});

const { canSendRating, canNotSendRating } = split(canUserSendRatingFx.done, {
  canSendRating: ({ result }) => result,
  canNotSendRating: ({ result }) => !result,
});

forward({
  from: canSendRating,
  to: blockUserSendRatingFx.prepend<{ params: MessageRating }>(
    ({ params }) => params.message
  ),
});

forward({
  from: canNotSendRating,
  to: removeMessageFx.prepend<{ params: MessageRating }>(
    ({ params }) => params.message
  ),
});

forward({
  from: canSendRating,
  to: removeMessageAfterTimeoutFx.prepend(({ params }) => ({
    message: params.message,
    ms: REMOVE_RATING_MESSAGE,
  })),
});

const { messageToUser, messageToBot } = split(canSendRating, {
  messageToUser: ({ params: { message } }) => {
    if (message.chat.type === "private") {
      return true;
    }

    // @ts-ignore
    return !message.reply_to_message.from.is_bot;
  },
  messageToBot: ({ params: { message } }) => {
    if (message.chat.type === "private") {
      return false;
    }

    // @ts-ignore
    return message.reply_to_message.from.is_bot;
  },
});

forward({
  from: messageToBot,
  to: replyToMessageFx.prepend<{ params: MessageRating }>(
    ({ params: { message } }) => ({
      message,
      text: "Я вне ваших рейтингов болван!",
    })
  ),
});

split({
  source: messageToUser.map(({ params }) => params),
  match: ({ message }: MessageRating) => {
    // @ts-ignore
    const recipientUserId = message.reply_to_message.from.id;

    if (message.from.id === recipientUserId) {
      return "messageSocialToSelf";
    }

    return "messageSocialToUser";
  },
  cases: {
    messageSocialToSelf: replyToMessageFx.prepend(
      ({ message }: MessageRating) => ({
        message,
        text: "Меня не обдуришь пес",
      })
    ),
    messageSocialToUser,
  },
});

split({
  source: messageSocialToUser.map<AddSocialRating>(
    ({ type, message }: MessageRating) => {
      //@ts-ignore
      const replyToMessage = message.reply_to_message;

      const fullName = `${replyToMessage.from.first_name || ""} ${
        replyToMessage.from.last_name || ""
      }`.trim();

      const username = `@${replyToMessage.from.username}`;

      return {
        type,
        chat: {
          id: message.chat.id,
          // @ts-ignore
          name: message.chat.title || "Private",
        },
        user: {
          id: replyToMessage.from.id,
          name: fullName,
          username,
        },
        replyToMessage: {
          id: replyToMessage.message_id,
          date: replyToMessage.date,
        },
      };
    }
  ),
  match: (data: AddSocialRating) => data.type,
  cases: {
    increase: socialCredit.increase,
    decrease: socialCredit.decrease,
  },
});
