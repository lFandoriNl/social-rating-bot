import { from, of, Subscription, ReplaySubject } from "rxjs";
import {
  filter,
  ignoreElements,
  map,
  switchMap,
  throttleTime,
} from "rxjs/operators";

import { bot } from "../../bot";
import {
  sendMessage,
  replyToMessage,
} from "../../services/message-action/init";
import { getTopUsersByRating } from "../../services/social-credit";
import { TG } from "../../services/types";

const asTable = require("as-table");

const fail = () =>
  "Черт, что-то пошло не так, зовите моих господинов @maximkoylo и @DmitryPLSKN";
const empty = () => "Рейтинг группы отсутствует";
const stats = (table: string) => `<pre>Рейтинг группы\n${table}</pre>`;

const chatSubscriptions: Array<{
  chatId: number;
  subscription: Subscription;
}> = [];

function listenOnStatCommand() {
  const sub = new ReplaySubject<TG["message"]>(1);

  bot.command("stat", (ctx) => {
    sub.next(ctx.update.message);
  });

  return sub;
}

const statCommand$ = listenOnStatCommand();

statCommand$.subscribe((message) => {
  if (chatSubscriptions.find((i) => i.chatId === message.chat.id)) {
    return;
  }

  const subscription = statCommand$
    .pipe(
      filter((sourceMessage) => sourceMessage.chat.id === message.chat.id),
      throttleTime(60 * 1000),
      switchMap((message) =>
        from(getTopUsersByRating({ chatId: message.chat.id })).pipe(
          map((users) => ({ message, users }))
        )
      ),
      switchMap(({ message, users }) => {
        if (!users) {
          return from(replyToMessage(message, fail())).pipe(ignoreElements());
        }

        if (users.length === 0) {
          return from(replyToMessage(message, empty())).pipe(ignoreElements());
        }

        return of({ message, users });
      }),
      map(({ message, users }) => ({
        message,
        table: asTable([
          ...users.map((user, index) => {
            const rating = user.rating.toString().startsWith("-")
              ? user.rating
              : ` ${user.rating}`;

            return [`${index + 1}.`, user.rank, rating, user.name];
          }),
        ]),
      })),
      switchMap(({ message, table }) =>
        from(
          sendMessage(message, stats(table), {
            parse_mode: "HTML",
          })
        )
      )
    )
    .subscribe();

  chatSubscriptions.push({
    chatId: message.chat.id,
    subscription,
  });
});
