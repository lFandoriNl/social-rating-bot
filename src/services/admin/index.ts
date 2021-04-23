import { createEffect } from "effector-root";

import { ChatMember, Message } from "typegram";

export const getChatAdministratorsFx = createEffect<Message, ChatMember[]>();
export const checkAdministratorFx = createEffect<Message, boolean>();
