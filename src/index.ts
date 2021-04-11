import { Telegraf } from "telegraf";
import { socialCreditService } from "./services/social-rating-service";
import { STICKER } from "./sticker-ids";

require("dotenv").config();

import "./db";

const bot = new Telegraf(process.env.BOT_TOKEN);

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
  // console.log("message", ctx.update.message);

  // @ts-ignore
  const text = ctx.update.message.text;
  // @ts-ignore
  const sticker = ctx.update.message.sticker;
  // @ts-ignore
  const replyToMessage = ctx.update.message.reply_to_message;

  const chatId = ctx.message.chat.id;
  // @ts-ignore
  const chatTitle = ctx.message.chat.title || "Unknown";

  if (text) {
    if (replyToMessage) {
    }
  }

  if (sticker) {
    if (replyToMessage) {
      const stickerId = sticker.file_unique_id;
      const recipientUserId = replyToMessage.from.id;
      const userName = `${replyToMessage.from.first_name || ""} ${
        replyToMessage.from.last_name || ""
      }`;

      if (replyToMessage.from.is_bot) {
        return;
      }

      if (ctx.message.from.id === recipientUserId) {
        return ctx.reply("Меня не обдуришь пес");
      }

      if (stickerId === STICKER.increaseSocialCredit) {
        socialCreditService.increase({
          chatId,
          chatName: chatTitle,
          userId: recipientUserId,
          userName,
        });
      }

      if (stickerId === STICKER.decreaseSocialCredit) {
        socialCreditService.decrease({
          chatId,
          chatName: chatTitle,
          userId: recipientUserId,
          userName,
        });
      }
    }
  }
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
