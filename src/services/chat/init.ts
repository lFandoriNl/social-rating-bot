import { canChatSendRouletteFx, blockChatSendRouletteFx } from "./index";

import { scheduler } from "../../common/scheduler";

import { BLOCK_SEND_ROULETTE } from "../../constants/timeouts";

canChatSendRouletteFx.use((message) => {
  const task = scheduler.find((task) => {
    if (task.type === "note" && task.name === "blockSendRoulette") {
      return task.data.chatId === message.chat.id;
    }
  });

  return Boolean(task) === false;
});

blockChatSendRouletteFx.use((message) => {
  scheduler.createNote({
    note: "blockSendRoulette",
    data: {
      chatId: message.chat.id,
    },
    timeout: BLOCK_SEND_ROULETTE,
  });
});
