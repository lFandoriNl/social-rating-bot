require("dotenv").config();

import { allSettled, fork, root } from "effector-root";

import { socialCredit } from "./services/social-credit";

import { taskRunner } from "./common/task-runner";
import { createQueue } from "./lib/queue";

import { commandRateEvent, commandUnRateEvent } from "./services/command-rate";
import { messageEvent } from "./services/message";
import { diceRollEvent, runRouletteEvent } from "./services/roll-action";

import { bot } from "./bot";
import { connectDB } from "./db";

import "./lib/task-runner";
import "./init";
import { checkAdministratorFx } from "./services/admin";
import { removeMessageFx } from "./services/message-action";

connectDB().then(() => bot.launch());

const queue = createQueue();

const scope = fork(root);

const commands = [
  { command: "rate", description: "Повысить рейтинг" },
  { command: "unrate", description: "Понизить рейтинг" },
  { command: "stat", description: "Показать рейтинг группы" },
  { command: "run_roulette", description: "Запустить рулетку (only admin)" },
  { command: "roll_dice", description: "Испытать удачу" },
  { command: "help", description: "Помощь" },
];

bot.telegram.setMyCommands(commands);

bot.command("start", (ctx) => {
  ctx.reply("Встаю на службу мой милорд!");
});

bot.command("quit", (ctx) => {
  ctx.leaveChat();
});

bot.help((ctx) => {
  const help = [
    "Я Надзиратель, я слежу за вашим рейтингом\n",
    "<b>Список моих команд</b>\n",
    ...commands.map(
      ({ command, description }) => `/${command} - ${description}`
    ),
    '\nВместо команд на рейтинг можно отправлять <a href="https://t.me/addstickers/PoohSocialCredit">стикеры</a>\n',
    "<b>Особенности работы</b>\n",
    "1. При отправке рейтинга без реплая сообщение удалится (нужны права админа)",
    "2. При отправке рейтинга с реплаем сообщение удалиться спустя 3 минуты",
    "3. Между отправкой рейтинга у каждого юзера таймаут на 3 минуты на отправку следующей команды",
    "4. На одно смс можно отправить только только одно повышение и одно понижение рейтинга",
    "5. Сообщения от команды /roll_dice удаляться спустя 30 секунд",
    "6. /run_roulette в рулетке разыгрывают рейтинг, запустить может только админ. Максимальное количество участников - 6",
  ].join("\n");

  ctx.reply(help, {
    parse_mode: "HTML",
  });
});

bot.command("stat", async (ctx) => {
  const chatId = ctx.chat.id;

  const users = await socialCredit.getTopUsersByRatingFx({ chatId });

  if (!users) {
    return ctx.reply(
      "Черт, что-то пошло не так, зовите моих господинов @maximkoylo и @DmitryPLSKN"
    );
  }

  if (users.length === 0) {
    return ctx.reply("Рейтинг группы отсутствует");
  }

  const usersList = users
    .map((user, index) => {
      const start = `${index + 1}.`;
      const end = `${user.rank}`.padEnd(20, " ");

      return `${start} ${end} ${user.name}`;
    })
    .join("\n");

  ctx.reply(`Рейтинг группы:\n${usersList}`);
});

bot.command("roll_dice", (ctx) => {
  diceRollEvent(ctx.update.message);
});

bot.command("run_roulette", async (ctx) => {
  // return;
  const isAdmin = checkAdministratorFx(ctx.update.message);

  if (isAdmin) {
    return runRouletteEvent(ctx.update.message);
  }

  removeMessageFx(ctx.update.message);
});

bot.command("rate", (ctx) => {
  // if (ctx.chat.id === -1001379121758) return;

  queue.push(async () => {
    await allSettled(commandRateEvent, { scope, params: ctx.update.message });
  });
});

bot.command("unrate", (ctx) => {
  // if (ctx.chat.id === -1001379121758) return;

  queue.push(async () => {
    await allSettled(commandUnRateEvent, { scope, params: ctx.update.message });
  });
});

bot.on("message", (ctx) => {
  // if (ctx.chat.id === -1001379121758) return;

  queue.push(async () => {
    await allSettled(messageEvent, { scope, params: ctx.update.message });
  });
});

process.on("SIGUSR2", () => {
  taskRunner.save().then(() => {
    process.exit();
  });
});

process.once("SIGINT", () => {
  bot.stop("SIGINT");

  taskRunner.save().then(() => {
    process.exit();
  });
});

process.once("SIGTERM", () => {
  bot.stop("SIGTERM");

  taskRunner.save().then(() => {
    process.exit();
  });
});
