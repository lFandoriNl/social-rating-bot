require("dotenv").config();

import { allSettled, fork, root } from "effector-root";

import { socialCredit } from "./services/social-credit";
import { createQueue } from "./lib/queue";
import { randomRange } from "./lib/random";

import { commandRateEvent, commandUnRateEvent } from "./services/command-rate";
import { messageEvent } from "./services/message";

import { bot } from "./bot";
import { connectDB } from "./db";

import "./init";

connectDB().then(() => bot.launch());

const queue = createQueue();

const scope = fork(root);

const commands = [
  { command: "rate", description: "Повысить рейтинг" },
  { command: "unrate", description: "Понизить рейтинг" },
  { command: "stat", description: "Показать пищевую цепочку" },
  { command: "roll_dice", description: "Испытать удачу" },
  { command: "help", description: "Что я могу" },
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
    "Я Надзиратель, я слежу за вашим рейтингом",
    "Список моих команд:",
    ...commands.map(
      ({ command, description }) => `/${command} - ${description}`
    ),
  ].join("\n");

  ctx.reply(help);
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
    return ctx.reply("Пищевая цепочка отсутствует");
  }

  const usersList = users
    .map((user, index) => {
      const start = `${index + 1}.`;
      const end = `${user.socialCredit}`.padEnd(10, " ");

      const needAddSpaceBeforeRating = end.startsWith("-") === false;

      return `${start} ${needAddSpaceBeforeRating ? "  " : ""}${end}${
        user.name
      }`;
    })
    .join("\n");

  ctx.reply(`Рейтинг пищевой цепочки:\n${usersList}`);
});

bot.command("roll_dice", (ctx) => {
  const variant = ["🎲", "🎯", "🏀", "🎳", "🎰"];

  ctx.telegram.sendDice(ctx.chat.id, {
    emoji: variant[randomRange(0, variant.length)],
    reply_to_message_id: ctx.message.message_id,
  });
});

bot.command("rate", (ctx) => {
  queue.push(async () => {
    await allSettled(commandRateEvent, { scope, params: ctx.update.message });
  });
});

bot.command("unrate", (ctx) => {
  queue.push(async () => {
    await allSettled(commandUnRateEvent, { scope, params: ctx.update.message });
  });
});

bot.on("message", (ctx) => {
  queue.push(async () => {
    await allSettled(messageEvent, { scope, params: ctx.update.message });
  });
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
