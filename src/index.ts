import { Telegraf } from "telegraf";
import { sticker } from "./sticker-ids";

require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.command("start", (ctx) => {
  ctx.telegram.sendMessage(ctx.chat.id, "Встаю на службу мой милорд!");
});

bot.command("quit", (ctx) => {
  ctx.leaveChat();
});

bot.on("text", (ctx) => {
  // ctx.reply(`Hello ${ctx.state.role}`);
});

bot.on("sticker", (ctx) => {
  const replyToMessage = ctx.update.message.reply_to_message;

  if (!replyToMessage) return null;

  const chatId = ctx.update.message.chat.id;
  const recipientUserId = replyToMessage.from.id;
  const stickerId = ctx.update.message.sticker.file_unique_id;

  if (stickerId === sticker.increaseSocialCredit) {
    console.log("increaseSocialCredit");
  }

  if (stickerId === sticker.decreaseSocialCredit) {
    console.log("decreaseSocialCredit");
  }
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
