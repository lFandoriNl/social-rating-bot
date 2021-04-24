import { forward, split } from "effector-root";

import { bot } from "../../bot";

import { delay } from "../../lib/delay";
import { randomRange } from "../../lib/random";

import { userRepository } from "../../repositories/user-repository";
import { UserModel } from "../../models/user-model";

import { REMOVE_DICE_ROLL } from "../../constants/timeouts";

import { blockChatSendRouletteFx, canChatSendRouletteFx } from "../chat";
import {
  removeMessageAfterTimeoutFx,
  removeMessageFx,
} from "../message-action";

import {
  diceRollEvent,
  diceRollFx,
  runRouletteEvent,
  runRouletteFx,
  rollDiceAndReturnValueFx,
} from "./index";

import { TG } from "../types";

rollDiceAndReturnValueFx.use(async (message) => {
  const diceRollMessage = await bot.telegram.sendDice(message.chat.id, {
    emoji: "🎲",
  });
  return [diceRollMessage.dice.value, diceRollMessage];
});

forward({
  from: diceRollEvent,
  to: diceRollFx,
});

diceRollFx.use(async (message) => {
  const variant = ["🎲", "🎯", "🏀", "🎳", "🎰"];

  const diceRollMessage = await bot.telegram.sendDice(message.chat.id, {
    emoji: variant[randomRange(0, variant.length - 1)],
    reply_to_message_id: message.message_id,
  });

  await removeMessageAfterTimeoutFx({ message, ms: REMOVE_DICE_ROLL });
  await removeMessageAfterTimeoutFx({
    message: diceRollMessage,
    ms: REMOVE_DICE_ROLL,
  });
});

forward({
  from: runRouletteEvent,
  to: canChatSendRouletteFx,
});

const { canSendRoulette, canNotSendRoulette } = split(
  canChatSendRouletteFx.done,
  {
    canSendRoulette: ({ result }) => result,
    canNotSendRoulette: ({ result }) => !result,
  }
);

forward({
  from: canSendRoulette.map(({ params }) => params),
  to: [runRouletteFx, removeMessageFx, blockChatSendRouletteFx],
});

forward({
  from: canNotSendRoulette,
  to: removeMessageFx.prepend<{ params: TG["message"] }>(
    ({ params }) => params
  ),
});

runRouletteFx.use(async (message) => {
  const users = await userRepository.getUserByChatId(message.chat.id);

  if (!users) {
    await bot.telegram.sendMessage(
      message.chat.id,
      "Рейтинг группы отсутствует"
    );
    return;
  }

  if (users.length < 2) {
    await bot.telegram.sendMessage(
      message.chat.id,
      "В рейтинге должно быть как минимум два человека"
    );
    return;
  }

  const winnerUser = users[randomRange(0, users.length - 1)];

  await bot.telegram.sendMessage(
    message.chat.id,
    [
      "<b>Начинаем рулетку, ставка - социальный рейтинг!</b>\n",
      `Наша жертва ${winnerUser.name}`,
      "\nВыпавший кубик решит его/ее судьбу!",
      "1..3 - прогорит, 4..6 - победит",
    ].join("\n"),
    {
      parse_mode: "HTML",
    }
  );

  await delay(2000);

  const [decisionValue] = await rollDiceAndReturnValueFx(message);

  await delay(3000);

  if (decisionValue >= 4) {
    await bot.telegram.sendMessage(
      message.chat.id,
      `<b>${winnerUser.name}</b> тебе повезло! Получаешь одобрение чата 👍`,
      {
        parse_mode: "HTML",
      }
    );

    console.log("Before win:", winnerUser.rating, winnerUser.name);
    await winnerUser.updateOne({
      rating: winnerUser.rating + 100,
    });

    const updatedUser = await UserModel.findById(winnerUser._id);
    console.log("After win:", updatedUser?.rating, winnerUser.name);
  }

  if (decisionValue <= 3) {
    await bot.telegram.sendMessage(
      message.chat.id,
      `<b>${winnerUser.name}</b> ха не повезло! Чат осуждает 👎`,
      {
        parse_mode: "HTML",
      }
    );

    console.log("Before win:", winnerUser.rating, winnerUser.name);
    await winnerUser.updateOne({
      rating: winnerUser.rating - 100,
    });

    const updatedUser = await UserModel.findById(winnerUser._id);
    console.log("After win:", updatedUser?.rating, winnerUser.name);
  }
});

runRouletteFx.failData.watch((error) => console.log(error.message));
