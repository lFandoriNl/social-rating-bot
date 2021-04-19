import * as path from "path";

import { bot } from "../bot";

import { rootFolder } from "../constants/path";
import { createTaskRunner } from "../lib/task-runner";

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

export const taskRunner = createTaskRunner({
  tasks,
  filepath: path.join(rootFolder, "storage", "timeout-tasks.json"),
});
