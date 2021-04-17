import { createEvent } from "effector-root";

import { STICKER } from "../../sticker-ids";
import { TG } from "../types";

export const messageEvent = createEvent<TG["message"]>();
export const messageSticker = messageEvent.filterMap((message) => {
  // @ts-ignore
  if (message.sticker) {
    return message;
  }
});

export const messageStickerSocial = messageSticker.filterMap((message) => {
  // @ts-ignore
  const stickerId = message.sticker.file_unique_id;

  if (
    [STICKER.increaseSocialCredit, STICKER.decreaseSocialCredit].includes(
      stickerId
    )
  ) {
    return message;
  }
});

export const messageReplyStickerSocial = messageStickerSocial.filterMap(
  (message) => {
    // @ts-ignore
    if (message.reply_to_message) {
      return message;
    }
  }
);

export const messageSocialToUser = createEvent<TG["message"]>();
