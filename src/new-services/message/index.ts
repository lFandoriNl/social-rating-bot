import { from, merge, of, Subject } from "rxjs";

import { bot } from "../../bot";

import { TG } from "../../services/types";
import {
  concatMap,
  filter,
  ignoreElements,
  map,
  mapTo,
  mergeMap,
  share,
} from "rxjs/operators";
import {
  removeMessage,
  replyToMessage,
} from "../../services/message-action/init";
import { addRatingToUser } from "../../services/social-credit";
import {
  blockUserSendRating,
  canUserSendRating,
} from "../../services/user/init";
import { rateCommand$, unRateCommand$ } from "../command";

import { STICKER } from "../../common/sticker-ids";

function listenOnMessage() {
  const message$ = new Subject<TG["message"]>();

  bot.on("message", (ctx) => {
    if (ctx.updateType === "message" && ctx.message) {
      message$.next(ctx.message);
    }
  });

  return message$;
}

const checkIsSocialSticker = (message: TG["message"]) => {
  if (!message.sticker) return false;

  // @ts-ignore
  const stickerId = message.sticker.file_unique_id;

  return [STICKER.increaseSocialCredit, STICKER.decreaseSocialCredit].includes(
    stickerId
  );
};

export function messageInit() {
  const message$ = listenOnMessage();

  const messageReply$ = merge(message$).pipe(
    filter((msg) => Boolean(msg.reply_to_message))
  );

  const messageNoReply$ = merge(message$).pipe(
    filter((msg) => !Boolean(msg.reply_to_message))
  );

  const ratingCommand$ = merge(
    rateCommand$.pipe(map((msg) => ({ type: "increase", msg } as const))),
    unRateCommand$.pipe(map((msg) => ({ type: "decrease", msg } as const)))
  );

  const ratingCommandReply$ = ratingCommand$.pipe(
    filter(({ msg }) => Boolean(msg.reply_to_message))
  );

  const ratingCommandNoReply$ = ratingCommand$.pipe(
    filter(({ msg }) => !Boolean(msg.reply_to_message))
  );

  const messageReplySticker$ = messageReply$.pipe(
    filter((msg) => Boolean(msg.sticker)),
    filter(checkIsSocialSticker),
    map((msg) => {
      // @ts-ignore
      const stickerId = msg.sticker.file_unique_id;

      const type: "increase" | "decrease" =
        STICKER.increaseSocialCredit === stickerId ? "increase" : "decrease";

      return {
        type,
        msg,
      };
    })
  );

  const messageNoReplySticker$ = messageNoReply$.pipe(
    filter((msg) => Boolean(msg.sticker)),
    filter(checkIsSocialSticker),
    map((msg) => ({ msg }))
  );

  merge(messageNoReplySticker$, ratingCommandNoReply$)
    .pipe(mergeMap(({ msg }) => from(removeMessage(msg))))
    .subscribe();

  const canUserSendRating$ = merge(
    messageReplySticker$,
    ratingCommandReply$
  ).pipe(
    mergeMap(({ type, msg }) => {
      const canSend = canUserSendRating(msg);

      if (canSend) {
        return of(blockUserSendRating(msg)).pipe(mapTo({ type, msg }));
      }

      return from(removeMessage(msg)).pipe(ignoreElements());
    }),
    share()
  );

  const ratingReplyToUser$ = canUserSendRating$.pipe(
    filter(({ msg }) => {
      if (!msg.reply_to_message) return false;

      const recipientUserId = msg.reply_to_message.from?.id;

      if (msg.from?.id === recipientUserId) {
        return false;
      }

      if (msg.chat.type === "private") {
        return true;
      }

      return !msg.reply_to_message.from?.is_bot;
    })
  );

  const ratingReplyToSelf$ = canUserSendRating$.pipe(
    filter(({ msg }) => {
      if (!msg.reply_to_message) return false;

      const recipientUserId = msg.reply_to_message.from?.id;

      if (msg.from?.id === recipientUserId) {
        return true;
      }

      if (msg.chat.type === "private") {
        return false;
      }

      return !msg.reply_to_message.from?.is_bot;
    })
  );

  ratingReplyToSelf$
    .pipe(
      mergeMap(({ msg }) => {
        return from(replyToMessage(msg, "Меня не обдуришь пес"));
      })
    )
    .subscribe();

  const ratingReplyToBot$ = canUserSendRating$.pipe(
    filter(({ msg }) => {
      if (msg.chat.type === "private") {
        return false;
      }

      return Boolean(msg.reply_to_message?.from?.is_bot);
    })
  );

  ratingReplyToBot$
    .pipe(
      mergeMap(({ msg }) => {
        return from(replyToMessage(msg, "Я вне ваших рейтингов болван!"));
      })
    )
    .subscribe();

  ratingReplyToUser$
    .pipe(
      map(({ type, msg }) => {
        const replyToMessage = msg.reply_to_message!;

        const fullName = `${replyToMessage.from?.first_name || ""} ${
          replyToMessage.from!.last_name || ""
        }`.trim();

        const username = `@${replyToMessage.from?.username}`;

        return {
          type,
          chat: {
            id: msg.chat.id,
            name: msg.chat.title || "Private",
          },
          user: {
            id: replyToMessage.from!.id,
            name: fullName,
            username,
            dateLastRating: new Date(),
          },
          replyToMessage: {
            id: replyToMessage.message_id,
            date: replyToMessage.date,
          },
        };
      }),
      concatMap((data) => from(addRatingToUser(data)))
    )
    .subscribe(console.log);
}
