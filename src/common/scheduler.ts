import * as path from "path";

import { bot } from "../bot";

import { createScheduler } from "../lib/scheduler";
import { rootFolder } from "../constants/path";

const tasks = {
  removeMessage: async ({
    chatId,
    messageId,
  }: {
    chatId: number;
    messageId: number;
  }) => {
    try {
      await bot.telegram.deleteMessage(chatId, messageId);
    } catch (error) {
      console.error(error.message);
    }
  },
};

export const scheduler = createScheduler({
  tasks,
  filepath: path.join(rootFolder, "storage", "timeout-tasks.json"),
});
