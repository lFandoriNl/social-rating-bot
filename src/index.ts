require("dotenv").config();

import { bot } from "./bot";
import { socialCreditService } from "./services/legacy-social-rating-service";
import { socialCredit } from "./services/social-credit";
import { createQueue } from "./lib/queue";
import { STICKER } from "./sticker-ids";

import { messageEvent } from "./services/message";

import "./init";
import "./db";

const queue = createQueue();

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

  const users = await socialCreditService.getTopUsersByRating(chatId);

  if (!users) {
    return ctx.reply(
      "Черт, что-то пошло не так, зовите моих господинов @maximkoylo и @DmitryPLSKN"
    );
  }

  if (users.length === 0) {
    return ctx.reply("Пищевая цепочка отсутствует");
  }

  // const usersList = users
  //   .map((user, index) => {
  //     // const start = `${index + 1}. ${user.name}`.padEnd(35, "\t");
  //     const start = `${index + 1}. ${user.name}`;
  //     const end = `${user.socialCredit}`;

  //     const needAddSpaceBeforeRating = end.startsWith("-") === false;

  //     return `${start}${needAddSpaceBeforeRating ? "  " : ""}${end}`;
  //   })
  //   .join("\n");

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
    messageEvent(ctx.update.message);
  });
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
