import { canChatSendRouletteFx, blockChatSendRouletteFx } from "./index";

import { taskRunner } from "../../common/task-runner";

import { BLOCK_SEND_ROULETTE } from "../../constants/timeouts";

canChatSendRouletteFx.use((message) => {
  const task = taskRunner.find((task) => {
    if (task.type === "note" && task.name === "blockSendRoulette") {
      return task.data.chatId === message.chat.id;
    }
  });

  return Boolean(task) === false;
});

blockChatSendRouletteFx.use((message) => {
  taskRunner.createNote({
    note: "blockSendRoulette",
    data: {
      chatId: message.chat.id,
    },
    timeout: BLOCK_SEND_ROULETTE,
  });
});
