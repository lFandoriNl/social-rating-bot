import { createEvent } from "effector-root";

import { STICKER } from "../../common/sticker-ids";
import { MessageRating, TG } from "../types";

export const messageEvent = createEvent<TG["message"]>();

export const messageReply = messageEvent.filter({
  // @ts-ignore
  fn: (message) => Boolean(message.reply_to_message),
});

export const messageSticker = messageEvent.filter({
  // @ts-ignore
  fn: (message) => Boolean(message.sticker),
});

export const messageStickerSocial = messageSticker.filterMap<MessageRating>(
  (message) => {
    // @ts-ignore
    const stickerId = message.sticker.file_unique_id;

    if (
      [STICKER.increaseSocialCredit, STICKER.decreaseSocialCredit].includes(
        stickerId
      )
    ) {
      return {
        type:
          STICKER.increaseSocialCredit === stickerId ? "increase" : "decrease",
        message,
      };
    }
  }
);

export const messageStickerSocialReply = messageStickerSocial.filter({
  // @ts-ignore
  fn: (messageRating) => Boolean(messageRating.message.reply_to_message),
});

export const messageStickerSocialNoReply = messageStickerSocial.filter({
  // @ts-ignore
  fn: (messageRating) => !Boolean(messageRating.message.reply_to_message),
});

export const messageSocialToUser = createEvent<MessageRating>();
