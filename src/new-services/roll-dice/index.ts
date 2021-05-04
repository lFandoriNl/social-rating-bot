import { from } from "rxjs";
import { mergeMap } from "rxjs/operators";

import { bot } from "../../bot";
import { rollDiceCommand$ } from "../command";

import { removeMessageAfterTimeout } from "../../services/message-action/init";

import { randomRange } from "../../lib/random";
import { REMOVE_DICE_ROLL } from "../../constants/timeouts";

import { TG } from "../../services/types";

async function rollDice(message: TG["message"]) {
  try {
    const variant = ["🎲", "🎯", "🏀", "🎳", "🎰"];

    const diceRollMessage = await bot.telegram.sendDice(message.chat.id, {
      // @ts-ignore
      emoji: variant[randomRange(0, variant.length - 1)],
      reply_to_message_id: message.message_id,
    });

    await removeMessageAfterTimeout(message, REMOVE_DICE_ROLL);
    await removeMessageAfterTimeout(diceRollMessage, REMOVE_DICE_ROLL);
  } catch (error) {}
}

rollDiceCommand$.pipe(mergeMap((msg) => from(rollDice(msg)))).subscribe();
