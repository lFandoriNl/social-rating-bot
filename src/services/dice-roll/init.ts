import { forward } from "effector";

import { bot } from "../../bot";
import { randomRange } from "../../lib/random";

import { REMOVE_DICE_ROLL } from "../../constants/timeouts";

import { removeMessageAfterTimeoutFx } from "../message-action";

import { diceRollEvent, sendDiceRollEventFx } from "./index";

forward({
  from: diceRollEvent,
  to: sendDiceRollEventFx,
});

sendDiceRollEventFx.use(async (message) => {
  const variant = ["🎲", "🎯", "🏀", "🎳", "🎰"];

  const diceRollMessage = await bot.telegram.sendDice(message.chat.id, {
    emoji: variant[randomRange(0, variant.length)],
    reply_to_message_id: message.message_id,
  });

  await removeMessageAfterTimeoutFx({ message, ms: REMOVE_DICE_ROLL });
  await removeMessageAfterTimeoutFx({
    message: diceRollMessage,
    ms: REMOVE_DICE_ROLL,
  });
});
