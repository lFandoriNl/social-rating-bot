import { from, of, Subscription, ReplaySubject } from "rxjs";
import {
  filter,
  ignoreElements,
  map,
  mergeMap,
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
  const statCommand$ = new ReplaySubject<TG["message"]>(1);

  bot.command("stat", (ctx) => {
    if (ctx.message) {
      statCommand$.next(ctx.message);
    }
  });

  return statCommand$;
}

const statCommand$ = listenOnStatCommand();

statCommand$.subscribe((message) => {
  if (chatSubscriptions.find((i) => i.chatId === message.chat.id)) {
    return;
  }

  const subscription$ = statCommand$
    .pipe(
      filter((msg) => msg.chat.id === message.chat.id),
      throttleTime(60 * 1000),
      mergeMap((msg) =>
        from(getTopUsersByRating({ chatId: msg.chat.id })).pipe(
          map((users) => ({ msg, users }))
        )
      ),
      mergeMap(({ msg, users }) => {
        if (!users) {
          return from(replyToMessage(msg, fail())).pipe(ignoreElements());
        }

        if (users.length === 0) {
          return from(replyToMessage(msg, empty())).pipe(ignoreElements());
        }

        return of({ msg, users });
      }),
      map(({ msg, users }) => ({
        msg,
        table: asTable([
          ...users.map((user, index) => {
            const rating = user.rating.toString().startsWith("-")
              ? user.rating
              : ` ${user.rating}`;

            return [`${index + 1}.`, user.rank, rating, user.name];
          }),
        ]),
      })),
      mergeMap(({ msg, table }) =>
        from(
          sendMessage(msg, stats(table), {
            parse_mode: "HTML",
          })
        )
      )
    )
    .subscribe();

  chatSubscriptions.push({
    chatId: message.chat.id,
    subscription: subscription$,
  });
});
