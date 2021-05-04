import { Subject } from "rxjs";
import { bot } from "../../bot";
import { TG } from "../../services/types";

function listenOnCommand(command: string) {
  const message$ = new Subject<TG["message"]>();

  bot.command(command, (ctx) => {
    if (ctx.message) {
      message$.next(ctx.message);
    }
  });

  return message$;
}

export const rateCommand$ = listenOnCommand("rate");

export const unRateCommand$ = listenOnCommand("unrate");

export const rollDiceCommand$ = listenOnCommand("roll_dice");
