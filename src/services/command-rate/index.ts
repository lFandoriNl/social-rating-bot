import { createEvent, merge } from "effector-root";

import { MessageRating, TG } from "../types";

export const commandRateEvent = createEvent<TG["message"]>();
export const commandUnRateEvent = createEvent<TG["message"]>();

export const commandRateReply = commandRateEvent.filterMap<MessageRating>(
  (message) => {
    // @ts-ignore
    if (message.reply_to_message) {
      return { type: "increase", message };
    }
  }
);

export const commandUnRateReply = commandUnRateEvent.filterMap<MessageRating>(
  (message) => {
    // @ts-ignore
    if (message.reply_to_message) {
      return { type: "decrease", message };
    }
  }
);

export const commandRateNoReply = merge([
  commandRateEvent,
  commandUnRateEvent,
]).filter({
  // @ts-ignore
  fn: (message) => !Boolean(message.reply_to_message),
});
