import { getChatAdministratorsFx, checkAdministratorFx } from ".";
import { bot } from "../../bot";

getChatAdministratorsFx.use(async (message) => {
  return await bot.telegram.getChatAdministrators(message.chat.id);
});

checkAdministratorFx.use(async (message) => {
  const members = await getChatAdministratorsFx(message);

  const isAdmin = Boolean(
    members.find((member) => {
      return (
        member.user.id === message.from?.id &&
        ["creator", "administrator"].includes(member.status)
      );
    })
  );

  return isAdmin;
});
