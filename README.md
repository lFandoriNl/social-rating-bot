# Social rating bot

## Запуск

Создать `.env`

```bash
BOT_TOKEN=
MONGO_DB=
```

Terminal

```bash
make run
```

or

```bash
yarn
start:watch (with nodemon)
```

## Функциональность

Основная цель бота следить за рейтингом участников группы

#### Команды

1. `/rate` - Повысить рейтинг
2. `/unrate` - Понизить рейтинг
3. `/stat` - Показать рейтинг группы
4. `/roll_dice` - Испытать удачу
5. `/help` - Помощь

Вместо команд на рейтинг можно отправлять [стикеры](https://t.me/addstickers/PoohSocialCredit)

#### Особенности работы

1. При отправке рейтинга без реплая сообщение удалится (нужны права админа)
2. При отправке рейтинга с реплаем сообщение удалиться спустя 3 минуты
3. Между отправкой рейтинга у каждого юзера таймаут на 3 минуты на отправку следующей команды
4. На одно смс можно отправить только только одно повышение и одно понижение рейтинга
