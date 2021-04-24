require("dotenv").config();

import { allSettled, fork, root } from "effector-root";

import { socialCredit } from "./services/social-credit";

import { UserModel } from "./models/user-model";
import { ChatModel } from "./models/chat-model";

import { taskRunner } from "./common/task-runner";
import { createQueue } from "./lib/queue";

import { commandRateEvent, commandUnRateEvent } from "./services/command-rate";
import { messageEvent } from "./services/message";
import { diceRollEvent, runRouletteEvent } from "./services/roll-action";

import { bot } from "./bot";
import { connectDB } from "./db";

import { checkAdministratorFx } from "./services/admin";
import { replyToMessageFx } from "./services/message-action";

import "./services/init";

import asTable = require("as-table");

connectDB().then(async () => {
  bot.launch();
  // const chat = await ChatModel.findOne({ chatId: -1001459291502 });
  // console.log(JSON.stringify(await UserModel.find({ chat: chat?._id })));
});

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
    "2. При отправке рейтинга с реплаем сообщение удалиться спустя час",
    "3. Между отправкой рейтинга у каждого юзера таймаут на 3 минуты на отправку следующей команды",
    "4. На одно смс можно отправить только только одно повышение и одно понижение рейтинга",
    "5. Сообщения от команды /roll_dice удаляться спустя 30 секунд",
    "6. /run_roulette в рулетке разыгрывается рейтинг который равен 5 стикерам для одного учасника рейтинга, запустить может только админ",
    "7. Таймаут на отправку рулетки 10 минут",
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

  const table = asTable([
    ...users.map((user, index) => {
      return [`${index + 1}.`, user.rank, user.name];
    }),
  ]);

  ctx.reply(`<pre>Рейтинг группы\n${table}</pre>`, { parse_mode: "HTML" });
});

bot.command("roll_dice", (ctx) => {
  diceRollEvent(ctx.update.message);
});

bot.command("run_roulette", async (ctx) => {
  const isAdmin = await checkAdministratorFx(ctx.update.message);

  if (isAdmin) {
    return runRouletteEvent(ctx.update.message);
  }

  replyToMessageFx({
    message: ctx.update.message,
    text: "Запускать рулетку может только админ",
  });
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
