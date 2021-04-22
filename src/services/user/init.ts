import { canUserSendRatingFx, blockUserSendRatingFx } from "./index";

import { taskRunner } from "../../common/task-runner";

import { BLOCK_SEND_RATING } from "../../constants/timeouts";

canUserSendRatingFx.use(({ message }) => {
  const task = taskRunner.find((task) => {
    if (task.type === "note" && task.name === "blockSendRating") {
      return (
        task.data.chatId === message.chat.id &&
        task.data.userId === message.from.id
      );
    }
  });

  return Boolean(task) === false;
});

blockUserSendRatingFx.use((message) => {
  taskRunner.createNote({
    note: "blockSendRating",
    data: {
      chatId: message.chat.id,
      userId: message.from.id,
    },
    timeout: BLOCK_SEND_RATING,
  });
});
