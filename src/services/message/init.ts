import { forward, guard, split, merge } from "effector-root";

import {
  removeMessageAfterTimeoutFx,
  removeMessageFx,
  replyToMessageFx,
} from "../message-action";
import {
  messageStickerSocial,
  messageReplyStickerSocial,
  messageNoReplyStickerSocial,
  messageSocialToUser,
} from "./index";

import { socialCredit } from "../social-credit";

import { AddSocialRating, MessageRating } from "../types";
import {
  commandRateReply,
  commandUnRateReply,
  commandRateNoReply,
} from "../command-rate";

forward({
  from: merge([
    messageNoReplyStickerSocial,
    commandRateNoReply.map((message) => ({ message })),
  ]),
  to: removeMessageFx.prepend(({ message }) => message),
});

forward({
  from: merge([messageStickerSocial, commandRateReply, commandUnRateReply]),
  to: removeMessageAfterTimeoutFx.prepend(({ message }) => ({
    message,
    ms: 3 * 60 * 1000,
  })),
});

const messageToUser = guard({
  source: merge([
    messageReplyStickerSocial,
    commandRateReply,
    commandUnRateReply,
  ]),
  filter: ({ message }) => {
    // console.log(message);
    if (message.chat.type !== "private") {
      // @ts-ignore
      if (message.reply_to_message.from.is_bot) {
        return false;
      }
    }

    return true;
  },
});

split({
  source: messageToUser,
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

      const userName = `${replyToMessage.from.first_name || ""} ${
        replyToMessage.from.last_name || ""
      }`.trim();

      return {
        type,
        chat: {
          id: message.chat.id,
          name: message.chat.type || "Private",
        },
        user: {
          id: replyToMessage.from.id,
          name: userName,
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
