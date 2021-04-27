require("dotenv").config();

import { allSettled, fork, root } from "effector-root";

import { socialCredit } from "./services/social-credit";

import { UserModel } from "./models/user-model";
import { ChatModel } from "./models/chat-model";

import { scheduler } from "./common/scheduler";
import { createQueue } from "./lib/queue";

import { commandRateEvent, commandUnRateEvent } from "./services/command-rate";
import { messageEvent } from "./services/message";
import {
  runCasinoEvent,
  diceRollEvent,
  runRouletteEvent,
} from "./services/roll-action";

import { bot } from "./bot";
import { connectDB } from "./db";

import { checkAdministratorFx } from "./services/admin";
import { replyToMessageFx } from "./services/message-action";

import "./new-services/init";

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
  // { command: "casino", description: "Казино" },
  { command: "stat", description: "Показать рейтинг группы" },
  // { command: "roulette", description: "Запустить рулетку (only admin)" },
  { command: "roll_dice", description: "Испытать удачу" },
  { command: "help_full", description: "Полная помощь" },
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
    '\n<a href="https://github.com/lFandoriNl/social-rating-bot">Репозиторий бота</a>',
  ].join("\n");

  ctx.reply(help, {
    parse_mode: "HTML",
    disable_web_page_preview: true,
  });
});

bot.command("help_full", (ctx) => {
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
    "6. Таймаут в игру казино 2 часа на одного пользователя",
    "7. /roulette в рулетке разыгрывается рейтинг который равен 5 стикерам для одного учасника рейтинга, запустить может только админ",
    "8. Таймаут на отправку рулетки 60 минут на весь чат",
    '\n<a href="https://github.com/lFandoriNl/social-rating-bot">Репозиторий бота</a>',
  ].join("\n");

  ctx.reply(help, {
    parse_mode: "HTML",
    disable_web_page_preview: true,
  });
});

// bot.command("casino", (ctx) => {
//   runCasinoEvent(ctx.update.message);
// });

// bot.command("roulette", async (ctx) => {
//   const isAdmin = await checkAdministratorFx(ctx.update.message);

//   if (isAdmin) {
//     return runRouletteEvent(ctx.update.message);
//   }

//   replyToMessageFx({
//     message: ctx.update.message,
//     text: "Запускать рулетку может только админ",
//   });
// });

bot.command("roll_dice", (ctx) => {
  diceRollEvent(ctx.update.message);
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

setTimeout(() => {
  bot.on("message", (ctx) => {
    // if (ctx.chat.id === -1001379121758) return;

    queue.push(async () => {
      await allSettled(messageEvent, { scope, params: ctx.update.message });
    });
  });
}, 1000);

process.on("SIGUSR2", () => {
  scheduler.save().then(() => {
    process.exit();
  });
});

process.once("SIGINT", () => {
  bot.stop("SIGINT");

  scheduler.save().then(() => {
    process.exit();
  });
});

process.once("SIGTERM", () => {
  bot.stop("SIGTERM");

  scheduler.save().then(() => {
    process.exit();
  });
});
