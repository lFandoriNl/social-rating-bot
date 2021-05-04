import { createEffect } from "effector-root";
import { ChatMember } from "telegram-typings";
import { TG } from "../types";

export const getChatAdministratorsFx = createEffect<
  TG["message"],
  ChatMember[]
>();
export const checkAdministratorFx = createEffect<TG["message"], boolean>();
