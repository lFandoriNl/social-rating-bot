import { getChatAdministratorsFx, checkAdministratorFx } from ".";
import { bot } from "../../bot";

getChatAdministratorsFx.use(async (message) => {
  return await bot.telegram.getChatAdministrators(message.chat.id);
});

checkAdministratorFx.use(async (message) => {
  const members = await getChatAdministratorsFx(message);

  const isAdmin = Boolean(
    members.find((member) => member.user.id === message.from?.id)
  );

  return isAdmin;
});
