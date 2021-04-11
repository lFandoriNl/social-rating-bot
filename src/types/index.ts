export type User = {
  userId: number;
  name: string;
  socialCredit: number;
  level: number;
};

export type Chat = {
  chatId: number;
  name: string;
  users: User[];
};

export type DB = {
  chats: Chat[];
};
