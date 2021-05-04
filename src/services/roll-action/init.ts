// import { forward, guard, sample, split } from "effector-root";

// import { bot } from "../../bot";

// import { delay } from "../../lib/delay";
// import { randomRange } from "../../lib/random";

// import { userRepository } from "../../repositories/user-repository";
// import { UserModel } from "../../models/user-model";

// import {
//   REMOVE_DICE_ROLL,
//   WAIT_SEND_BET_CASINO,
// } from "../../constants/timeouts";

// import { canChatSendRouletteFx, blockChatSendRouletteFx } from "../chat";
// import {
//   canUserSendCasinoFx,
//   blockUserSendCasinoFx,
//   checkHasCasinoGame,
// } from "../user";
// import {
//   removeMessageAfterTimeoutFx,
//   removeMessageFx,
//   replyToMessageFx,
// } from "../message-action";

// import { scheduler } from "../../common/scheduler";
// import { removeSchedulerTaskByIdFx } from "../scheduler";
// import { chatRepository } from "../../repositories/chat-repository";

// import {
//   diceRollEvent,
//   diceRollFx,
//   runRouletteEvent,
//   runRouletteFx,
//   runCasinoEvent,
//   runCasinoFx,
//   rollDiceCasinoGameFx,
//   rollDiceAndReturnValueFx,
// } from "./index";

// import { TG } from "../types";

// rollDiceAndReturnValueFx.use(async ({ message, extra = {} }) => {
//   const diceRollMessage = await bot.telegram.sendDice(message.chat.id, {
//     // @ts-ignore
//     emoji: "🎲",
//     ...extra,
//   });
//   return [diceRollMessage.dice.value, diceRollMessage];
// });

// forward({
//   from: runRouletteEvent,
//   to: canChatSendRouletteFx,
// });

// const { canSendRoulette, canNotSendRoulette } = split(
//   canChatSendRouletteFx.done,
//   {
//     canSendRoulette: ({ result }) => result,
//     canNotSendRoulette: ({ result }) => !result,
//   }
// );

// forward({
//   from: canSendRoulette.map(({ params }) => params),
//   to: [runRouletteFx, removeMessageFx, blockChatSendRouletteFx],
// });

// forward({
//   from: canNotSendRoulette,
//   to: removeMessageFx.prepend<{ params: TG["message"] }>(
//     ({ params }) => params
//   ),
// });

// runRouletteFx.use(async (message) => {
//   const users = await userRepository.getUsersByChatId(message.chat.id);

//   if (!users) {
//     await bot.telegram.sendMessage(
//       message.chat.id,
//       "Рейтинг группы отсутствует"
//     );
//     return;
//   }

//   if (users.length < 2) {
//     await bot.telegram.sendMessage(
//       message.chat.id,
//       "В рейтинге должно быть как минимум два человека"
//     );
//     return;
//   }

//   const winnerUser = users[randomRange(0, users.length - 1)];

//   await bot.telegram.sendMessage(
//     message.chat.id,
//     [
//       "<b>Начинаем рулетку, ставка - социальный рейтинг!</b>\n",
//       `Наша жертва ${winnerUser.name}`,
//       "\nВыпавший кубик решит его/ее судьбу!",
//       "1..3 - прогорит, 4..6 - победит",
//     ].join("\n"),
//     {
//       parse_mode: "HTML",
//     }
//   );

//   await delay(2000);

//   const [decisionValue] = await rollDiceAndReturnValueFx({ message });

//   await delay(3000);

//   if (decisionValue >= 4) {
//     await bot.telegram.sendMessage(
//       message.chat.id,
//       `<b>${winnerUser.name}</b> тебе повезло! Получаешь одобрение от Надзирателя 👍`,
//       {
//         parse_mode: "HTML",
//       }
//     );

//     console.log("Before win:", winnerUser.rating, winnerUser.name);
//     await winnerUser.updateOne({
//       rating: winnerUser.rating + 100,
//     });

//     const updatedUser = await UserModel.findById(winnerUser._id);
//     console.log("After win:", updatedUser?.rating, winnerUser.name);
//   }

//   if (decisionValue <= 3) {
//     await bot.telegram.sendMessage(
//       message.chat.id,
//       `<b>${winnerUser.name}</b> ха не повезло! Надзиратель ухмыляется 👎`,
//       {
//         parse_mode: "HTML",
//       }
//     );

//     console.log("Roulette before win:", winnerUser.rating, winnerUser.name);
//     await winnerUser.updateOne({
//       rating: winnerUser.rating - 100,
//     });

//     const updatedUser = await UserModel.findById(winnerUser._id);
//     console.log("Roulette after win:", updatedUser?.rating, winnerUser.name);
//   }
// });

// runRouletteFx.failData.watch((error) => console.log(error.message));

// forward({
//   from: runCasinoEvent,
//   to: canUserSendCasinoFx,
// });

// const { userExist, noUser } = split(canUserSendCasinoFx.done, {
//   userExist: ({ result }) => result.hasUser,
//   noUser: ({ result }) => !result.hasUser,
// });

// forward({
//   from: noUser,
//   to: replyToMessageFx.prepend(({ params }) => ({
//     message: params,
//     text: "Вас нету в рейтинге группы",
//   })),
// });

// const { canSendCasino, canNotSendCasino } = split(userExist, {
//   canSendCasino: ({ result }) => result.canSendCasino,
//   canNotSendCasino: ({ result }) => !result.canSendCasino,
// });

// forward({
//   from: canSendCasino.map(({ params }) => params),
//   to: [runCasinoFx, blockUserSendCasinoFx],
// });

// forward({
//   from: canNotSendCasino,
//   to: removeMessageFx.prepend<{ params: TG["message"] }>(
//     ({ params }) => params
//   ),
// });

// runCasinoFx.use(async (message) => {
//   const startCasinoMessage = await replyToMessageFx({
//     message,
//     text: [
//       `Добро пожаловать в казино <b>${message.from!.first_name || ""} ${
//         message.from!.last_name || ""
//       }</b>, где ставка твой социальный рейтинг!\n`,
//       "Отправь в течении минуты реплаем к этому сообщению свою ставку в формате:",
//       "{твоя_ставка} {какой_кубик_выпадет}\n",
//       'Для примера: "40 6" - значение кубика от 1 до 6',
//       "Ставка может быть от 1 до 100, а кубик от 1 до 6\n",
//       "Если угадаешь с кубиком получишь <b>х4</b> рейтинга от своей ставки, если нет то потеряешь свой рейтинг!",
//     ].join("\n"),
//     extra: {
//       parse_mode: "HTML",
//     },
//   });

//   scheduler.createNote({
//     note: "casinoGame",
//     data: {
//       messageId: startCasinoMessage.message_id,
//       userId: message.from!.id,
//     },
//     timeout: WAIT_SEND_BET_CASINO,
//   });
// });

// forward({
//   from: messageReply,
//   to: checkHasCasinoGame,
// });

// const casinoGame = guard({
//   source: checkHasCasinoGame.doneData,
//   filter: ({ gameId }) => Boolean(gameId),
// });

// const prepareCasinoGame = sample({
//   source: casinoGame,
//   fn: ({ gameId, message }) => {
//     // @ts-ignore
//     const textBet: string = message.text || "";

//     const [ratingBet, diceBet] = textBet
//       .trim()
//       .split(" ")
//       .filter(Boolean)
//       .map(Number)
//       .filter(Number)
//       .map(Math.round);

//     return {
//       gameId,
//       ratingBet,
//       diceBet,
//       message,
//     };
//   },
// });

// split({
//   source: prepareCasinoGame,
//   match: {
//     invalidNumbers: ({ ratingBet, diceBet }) => {
//       return (
//         !ratingBet ||
//         !diceBet ||
//         ratingBet <= 0 ||
//         ratingBet > 100 ||
//         diceBet <= 0 ||
//         diceBet > 6
//       );
//     },
//   },
//   cases: {
//     invalidNumbers: replyToMessageFx.prepend(
//       ({ message }: { message: TG["message"] }) => ({
//         message,
//         text: "Рейтинг должен быть от 1 до 100, значение кубика от 1 до 6",
//       })
//     ),
//     __: rollDiceCasinoGameFx,
//   },
// });

// rollDiceCasinoGameFx.use(async ({ gameId, ratingBet, diceBet, message }) => {
//   if (gameId) {
//     await removeSchedulerTaskByIdFx(gameId);
//   }

//   const chat = await chatRepository.getChatByIdFx(message.chat.id);
//   const user = await UserModel.findOne({
//     userId: message.from!.id,
//     chat: chat?._id,
//   });

//   const [diceResult] = await rollDiceAndReturnValueFx({
//     message,
//     extra: {
//       reply_to_message_id: message.message_id,
//     },
//   });

//   await delay(3000);

//   if (diceResult === diceBet) {
//     await replyToMessageFx({
//       message,
//       text: `Джекпот! Забирай свои ${ratingBet * 4} рейтинга 🎉`,
//     });

//     if (user) {
//       console.log("Casino before win:", user.rating, user.name);
//       await user.updateOne({
//         rating: user.rating + ratingBet * 4,
//       });

//       const updatedUser = await UserModel.findById(user._id);
//       console.log("Casino after win:", updatedUser?.rating, user.name);
//     }

//     return;
//   }

//   if (user) {
//     console.log("Casino before win:", user.rating, user.name);
//     await user.updateOne({
//       rating: user.rating - ratingBet,
//     });

//     const updatedUser = await UserModel.findById(user._id);
//     console.log("Casino after win:", updatedUser?.rating, user.name);
//   }

//   await replyToMessageFx({
//     message,
//     text: `Не повезло! Ты потерял свои ${ratingBet} рейтинга, приходи в следующий раз, может повезет 🍀`,
//   });
// });
