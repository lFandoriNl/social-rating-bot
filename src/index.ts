require("dotenv").config();

import { allSettled, fork, root } from "effector-root";

import { socialCredit } from "./services/social-credit";
import { createQueue } from "./lib/queue";

import { messageEvent } from "./services/message";

import { bot } from "./bot";
import { connectDB } from "./db";

import "./init";

connectDB().then(() => bot.launch());

const queue = createQueue();

const scope = fork(root);

bot.command("start", (ctx) => {
  ctx.telegram.sendMessage(ctx.chat.id, "Встаю на службу мой милорд!");
});

bot.command("quit", (ctx) => {
  ctx.leaveChat();
});

bot.help((ctx) => {
  ctx.reply(`
  Я Надзиратель, я слежу за вашим рейтингом 
Список моих команд:
/stat - показать пищевую цепочку
  `);
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
      // const start = `${index + 1}. ${user.name}`.padEnd(35, "\t");
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

bot.on("message", (ctx) => {
  queue.push(async () => {
    await allSettled(messageEvent, { scope, params: ctx.update.message });
  });
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
