import { Observable } from "rxjs";

import { bot } from "../../bot";
import { TG } from "../../services/types";

function listenOnMessage() {
  return new Observable<TG["message"]>((subscriber) => {
    bot.on("message", (ctx) => {
      subscriber.next(ctx.update.message);
    });
  });
}

// listenOnMessage().subscribe(console.log);
