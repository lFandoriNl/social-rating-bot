import { forward } from "effector-root";

import { bot } from "../../bot";

import { delay } from "../../lib/delay";
import { randomRange, takeRandomValues } from "../../lib/random";

import { userRepository } from "../../repositories/user-repository";
import { User, UserModel } from "../../models/user-model";

import { REMOVE_DICE_ROLL } from "../../constants/timeouts";

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
    emoji: variant[randomRange(0, variant.length)],
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
  to: runRouletteFx,
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

  const randomUsers = takeRandomValues(users, 6);

  await bot.telegram.sendMessage(
    message.chat.id,
    [
      "*Начинаем рулетку, ставка - социальный рейтинг!*\n",
      "Список наших учасников",
      ...randomUsers.map((user, index) => `${index + 1}. ${user.name}`),
    ].join("\n"),
    {
      parse_mode: "Markdown",
    }
  );

  await delay(2000);

  await bot.telegram.sendMessage(message.chat.id, "Кубик брошен!");

  await delay(1000);

  let winnerUser: User | null = null;

  while (!winnerUser) {
    const [diceValue, rollDiceMessage] = await rollDiceAndReturnValueFx(
      message
    );

    await delay(3000);

    const randomUser = randomUsers[diceValue - 1];

    if (randomUser) {
      winnerUser = randomUser;
    } else {
      removeMessageFx(rollDiceMessage);
    }
  }

  await bot.telegram.sendMessage(
    message.chat.id,
    `Победитель: *${winnerUser.name}*`,
    {
      parse_mode: "Markdown",
    }
  );

  await delay(2000);

  await bot.telegram.sendMessage(
    message.chat.id,
    "Добавим рейтинга или убавим? Да - 4..6, Нет - 1..3"
  );

  await delay(2000);

  const [decisionValue] = await rollDiceAndReturnValueFx(message);

  await delay(3000);

  if (decisionValue >= 4) {
    await bot.telegram.sendMessage(
      message.chat.id,
      `*${winnerUser.name}* тебе повезло! Получаешь одобрение чата 👍`,
      {
        parse_mode: "Markdown",
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
      `*${winnerUser.name}* от ты кожаный дурак! Чат осуждает 👎`,
      {
        parse_mode: "Markdown",
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
