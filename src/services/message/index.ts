import { createEvent } from "effector-root";

import { STICKER } from "../../sticker-ids";
import { MessageRating, TG } from "../types";

export const messageEvent = createEvent<TG["message"]>();

export const messageSticker = messageEvent.filterMap((message) => {
  // @ts-ignore
  if (message.sticker) {
    return message;
  }
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

export const messageReplyStickerSocial = messageStickerSocial.filterMap(
  (messageRating) => {
    // @ts-ignore
    if (messageRating.message.reply_to_message) {
      return messageRating;
    }
  }
);

export const messageSocialToUser = createEvent<MessageRating>();
