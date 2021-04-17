import { ChatModel } from "../models/chat-model";
import { UserModel, User } from "../models/user-model";
import { MessageModel } from "../models/message-model";

type AddSocialRating = {
  chatId: number;
  chatName: string;
  userId: number;
  userName: string;
  replyToMessage: { id: number; date: number };
};

class SocialCreditService {
  private async addSocialRating(
    { chatId, chatName, userId, userName, replyToMessage }: AddSocialRating,
    rating: number
  ) {
    try {
      console.log({ chatId, chatName, userId, userName }, rating);

      let chat = await ChatModel.findOne({ chatId });

      if (!chat) {
        chat = new ChatModel({ chatId, name: chatName });
        await chat.save();
      }

      const message = await MessageModel.findOne({
        messageId: replyToMessage.id,
        chat: chat._id,
      });

      if (!message) {
        if (rating > 0) {
          const newMessage = new MessageModel({
            messageId: replyToMessage.id,
            date: replyToMessage.date,
            increased: true,
            chat: chat._id,
          });
          await newMessage.save();
        }

        if (rating < 0) {
          const newMessage = new MessageModel({
            messageId: replyToMessage.id,
            date: replyToMessage.date,
            decreased: true,
            chat: chat._id,
          });
          await newMessage.save();
        }
      }

      if (message) {
        if (rating > 0 && message.increased) {
          return;
        }

        if (rating > 0 && message.decreased) {
          await message.updateOne({
            increased: true,
          });
        }

        if (rating < 0 && message.decreased) {
          return;
        }

        if (rating < 0 && message.increased) {
          await message.updateOne({
            decreased: true,
          });
        }
      }

      if (chat) {
        const user = await UserModel.findOne({ userId, chat: chat._id });

        if (user) {
          return await user.updateOne({
            name: userName,
            socialCredit: user.socialCredit + rating,
          });
        }

        const newUser = new UserModel({
          userId,
          name: userName,
          socialCredit: rating,
          level: 0,
          chat: chat._id,
        });
        return await newUser.save();
      }

      const newChat = new ChatModel({ chatId, name: chatName });
      await newChat.save();

      // const newUser = new UserModel({
      //   userId,
      //   name: userName,
      //   socialCredit: rating,
      //   level: 0,
      //   chat: newChat._id,
      // });
      // await newUser.save();
    } catch (error) {
      console.error(error);
    }
  }

  async increase(data: AddSocialRating) {
    const rating = 20;
    await this.addSocialRating(data, rating);
  }

  async decrease(data: AddSocialRating) {
    const rating = -20;
    await this.addSocialRating(data, rating);
  }

  async getTopUsersByRating(chatId: number): Promise<User[] | null> {
    try {
      const chat = await ChatModel.findOne({ chatId });

      if (!chat) {
        return [];
      }

      const users = await UserModel.find({ chat: chat._id }).sort({
        socialCredit: "desc",
      });

      return users;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

export const socialCreditService = new SocialCreditService();
