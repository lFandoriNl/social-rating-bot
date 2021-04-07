import { Telegraf } from "telegraf";

require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.command("quit", (ctx) => {
  ctx.leaveChat();
});

bot.on("text", (ctx) => {
  ctx.reply(`Hello ${ctx.state.role}`);
});

bot.on("callback_query", (ctx) => {
  ctx.answerCbQuery();
});

bot.on("inline_query", (ctx) => {
  const result = [];

  ctx.answerInlineQuery(result);
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
