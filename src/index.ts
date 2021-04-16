import { Telegraf } from "telegraf";
import { socialCreditService } from "./services/social-rating-service";
import { createQueue } from "./lib/queue";
import { STICKER } from "./sticker-ids";

require("dotenv").config();

import "./db";

const queue = createQueue();

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
  queue.push(async () => {
    // console.log("message", ctx.update.message);

    const message = ctx.update.message;
    // @ts-ignore
    const sticker = message.sticker;
    // @ts-ignore
    const replyToMessage = message.reply_to_message;

    const chatId = message.chat.id;
    const chatType = message.chat.type;
    // @ts-ignore
    const chatTitle = message.chat.title || "Unknown";

    if (sticker) {
      const stickerId = sticker.file_unique_id;

      if (
        [STICKER.increaseSocialCredit, STICKER.decreaseSocialCredit].includes(
          stickerId
        )
      ) {
        setTimeout(async () => {
          try {
            await ctx.deleteMessage(message.message_id);
          } catch (error) {
            console.error(error);
          }
        }, 5 * 60 * 1000);
      }

      if (replyToMessage) {
        const recipientUserId = replyToMessage.from.id;
        const replyToMessageId = replyToMessage.message_id;
        const replyToMessageDate = replyToMessage.date;
        const userName = `${replyToMessage.from.first_name || ""} ${
          replyToMessage.from.last_name || ""
        }`.trim();

        if (chatType !== "private") {
          if (replyToMessage.from.is_bot) {
            return;
          }
        }

        if (message.from.id === recipientUserId) {
          return ctx.reply("Меня не обдуришь пес");
        }

        if (stickerId === STICKER.increaseSocialCredit) {
          await socialCreditService.increase({
            chatId,
            chatName: chatTitle,
            userId: recipientUserId,
            userName,
            replyToMessage: {
              id: replyToMessageId,
              date: replyToMessageDate,
            },
          });
        }

        if (stickerId === STICKER.decreaseSocialCredit) {
          await socialCreditService.decrease({
            chatId,
            chatName: chatTitle,
            userId: recipientUserId,
            userName,
            replyToMessage: {
              id: replyToMessageId,
              date: replyToMessageDate,
            },
          });
        }
      }
    }
  });
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
