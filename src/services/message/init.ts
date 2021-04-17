import { forward, guard, split } from "effector";

import {
  removeMessageAfterTimeoutFx,
  replyToMessageFx,
} from "../message-action";
import {
  messageStickerSocial,
  messageReplyStickerSocial,
  messageSocialToUser,
} from "./index";

import { TG } from "../types";

forward({
  from: messageStickerSocial,
  to: removeMessageAfterTimeoutFx.prepend((message) => ({
    message,
    ms: 5 * 60 * 100,
  })),
});

const messageNotToBot = guard({
  source: messageReplyStickerSocial,
  filter: (message) => {
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
  source: messageNotToBot,
  // source: messageReplyStickerSocial,
  match: (message: TG["message"]) => {
    // @ts-ignore
    const recipientUserId = message.reply_to_message.from.id;
    console.log(message.from.id, recipientUserId);
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
