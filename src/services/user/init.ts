import {
  canUserSendRatingFx,
  blockUserSendRatingFx,
  canUserSendCasinoFx,
  blockUserSendCasinoFx,
  checkHasCasinoGame,
} from "./index";

import { scheduler } from "../../common/scheduler";

import { BLOCK_SEND_CASINO, BLOCK_SEND_RATING } from "../../constants/timeouts";
import { UserModel } from "../../models/user-model";
import { TG } from "../types";

canUserSendRatingFx.use(({ message }) => {
  const task = scheduler.find((task) => {
    if (task.type === "note" && task.name === "blockSendRating") {
      return (
        task.data.chatId === message.chat.id &&
        task.data.userId === message.from!.id
      );
    }
  });

  return Boolean(task) === false;
});

blockUserSendRatingFx.use((message) => {
  scheduler.createNote({
    note: "blockSendRating",
    data: {
      chatId: message.chat.id,
      userId: message.from!.id,
    },
    timeout: BLOCK_SEND_RATING,
  });
});

canUserSendCasinoFx.use(async (message) => {
  const task = scheduler.find((task) => {
    if (task.type === "note" && task.name === "blockSendCasino") {
      return (
        task.data.chatId === message.chat.id &&
        task.data.userId === message.from!.id
      );
    }
  });

  const user = await UserModel.findOne({ userId: message.from!.id });

  return {
    canSendCasino: Boolean(task) === false,
    hasUser: Boolean(user),
  };
});

blockUserSendCasinoFx.use((message) => {
  scheduler.createNote({
    note: "blockSendCasino",
    data: {
      chatId: message.chat.id,
      userId: message.from!.id,
    },
    timeout: BLOCK_SEND_CASINO,
  });
});

checkHasCasinoGame.use((message) => {
  const task = scheduler.find((task) => {
    if (task.type === "note" && task.name === "casinoGame") {
      return (
        task.data.messageId === message.reply_to_message?.message_id &&
        task.data.userId === message.from?.id
      );
    }
  });

  return {
    gameId: task?.id,
    message,
  };
});

export function canUserSendRating(message: TG["message"]) {
  const task = scheduler.find((task) => {
    if (task.type === "note" && task.name === "blockSendRating") {
      return (
        task.data.chatId === message.chat.id &&
        task.data.userId === message.from!.id
      );
    }
  });

  return Boolean(task) === false;
}

export function blockUserSendRating(message: TG["message"]) {
  scheduler.createNote({
    note: "blockSendRating",
    data: {
      chatId: message.chat.id,
      userId: message.from!.id,
    },
    timeout: BLOCK_SEND_RATING,
  });

  return true;
}
