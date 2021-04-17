import { forward, guard, sample, split } from "effector-root";

import {
  removeMessageAfterTimeoutFx,
  replyToMessageFx,
} from "../message-action";
import {
  messageStickerSocial,
  messageReplyStickerSocial,
  messageSocialToUser,
} from "./index";

import { socialCredit } from "../social-credit";

import { STICKER } from "../../sticker-ids";
import { TG, AddSocialRating } from "../types";

forward({
  from: messageStickerSocial,
  to: removeMessageAfterTimeoutFx.prepend((message) => ({
    message,
    ms: 5 * 60 * 1000,
  })),
});

const messageToUser = guard({
  source: messageReplyStickerSocial,
  filter: (message) => {
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
  match: (message: TG["message"]) => {
    // @ts-ignore
    const recipientUserId = message.reply_to_message.from.id;

    if (message.from.id === recipientUserId) {
      return "messageSocialToSelf";
    }

    return "messageSocialToUser";
  },
  cases: {
    messageSocialToSelf: replyToMessageFx.prepend((message: TG["message"]) => ({
      message,
      text: "Меня не обдуришь пес",
    })),
    messageSocialToUser,
  },
});

split({
  source: messageSocialToUser.map<AddSocialRating>((message) => {
    // @ts-ignore
    const stickerId = message.sticker.file_unique_id;

    //@ts-ignore
    const replyToMessage = message.reply_to_message;

    const userName = `${replyToMessage.from.first_name || ""} ${
      replyToMessage.from.last_name || ""
    }`.trim();

    return {
      type:
        STICKER.increaseSocialCredit === stickerId ? "increase" : "decrease",
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
  }),
  match: (data: AddSocialRating) => data.type,
  cases: {
    increase: socialCredit.increase,
    decrease: socialCredit.decrease,
  },
});
