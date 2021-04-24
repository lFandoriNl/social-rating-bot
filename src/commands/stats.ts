import { createCanvas, loadImage } from "canvas";

const testRating = [
  { level: 6, text: "Покровитель ЦП", points: { from: 306, to: 458 } },
  { level: 5, text: "Друг Антона", points: { from: 204, to: 305 } },
  { level: 4, text: "Элита", points: { from: 136, to: 203 } },
  { level: 3, text: "Знаменитый", points: { from: 91, to: 135 } },
  { level: 2, text: "Подлиза", points: { from: 61, to: 90 } },
  { level: 1, text: "Узнаваемый", points: { from: 41, to: 60 } },
  { level: 0, text: "Обыватель", points: { from: -40, to: 40 } },
  { level: -1, text: "Проходимец", points: { from: -68, to: -41 } },
  { level: -2, text: "Душнила", points: { from: -116, to: -69 } },
  { level: -3, text: "Ненавистник", points: { from: -197, to: -117 } },
  { level: -4, text: "Украинец 🇺🇦", points: { from: -335, to: -198 } },
  { level: -5, text: "Дно", points: { from: -569, to: -336 } },
  { level: -6, text: "Хейтер ЦП", points: { from: -967, to: -570 } },
];

const testUsers = [
  {
    _id: "607c678f2d5da0006e55cace",
    userId: 465729749,
    name: "Maxim Koylo",
    rating: -440,
    level: 0,
    chat: "607c678f2d5da0006e55cacc",
    __v: 0,
  },
  {
    _id: "607c72d9bcdc820254752f75",
    userId: 304648510,
    name: "Dimitri ✨🧝🏻‍♀️✨",
    rating: -120,
    level: 0,
    chat: "607c678f2d5da0006e55cacc",
    __v: 0,
  },
  {
    _id: "607d1b70a1dd9f077b059370",
    userId: 193355758,
    name: "Artjom Kalita",
    rating: 0,
    level: 0,
    chat: "607c678f2d5da0006e55cacc",
    __v: 0,
  },
  {
    _id: "607da5bced9a2b14daff3c9d",
    userId: 198887264,
    name: "Anton Okolelov",
    rating: -100,
    level: 0,
    chat: "607c678f2d5da0006e55cacc",
    __v: 0,
    username: "@antonokolelov",
  },
  {
    _id: "607e82f7654d886500c3bf4a",
    userId: 125907120,
    name: "Nikita Vasilchenko",
    rating: 180,
    level: 0,
    chat: "607c678f2d5da0006e55cacc",
    __v: 0,
  },
  {
    _id: "607e98e83c943b69ceb5391d",
    userId: 53537142,
    name: "С Ф",
    rating: -20,
    level: 0,
    chat: "607c678f2d5da0006e55cacc",
    __v: 0,
  },
  {
    _id: "607f1887ea3a6d735679bacf",
    userId: 198300681,
    name: "Victor Karabedyants",
    rating: -80,
    level: 0,
    chat: "607c678f2d5da0006e55cacc",
    __v: 0,
  },
  {
    _id: "6080288417118e8432542da6",
    userId: 126358045,
    name: "Vitaly Rymarau",
    rating: 20,
    level: 0,
    chat: "607c678f2d5da0006e55cacc",
    __v: 0,
  },
  {
    _id: "6080291e17118e8432542da8",
    userId: 309238121,
    name: "R V",
    rating: -240,
    level: 0,
    chat: "607c678f2d5da0006e55cacc",
    __v: 0,
    username: "@fredddie",
  },
  {
    _id: "60802fef6ad82785b656f888",
    userId: 69318849,
    name: "art. ap.",
    rating: -120,
    level: 0,
    chat: "607c678f2d5da0006e55cacc",
    __v: 0,
    username: "@kpblc",
  },
  {
    _id: "60805c416ad82785b656f892",
    userId: 235972401,
    name: "А В",
    rating: 40,
    level: 0,
    chat: "607c678f2d5da0006e55cacc",
    __v: 0,
    username: "@faceashovel",
  },
  {
    _id: "60816bbf5d530512aad67e1e",
    userId: 3410421,
    name: "Oleg Gritsak",
    rating: 40,
    level: 0,
    chat: "607c678f2d5da0006e55cacc",
    __v: 0,
  },
  {
    _id: "6082c63d920e0b67c81e353d",
    userId: 89605351,
    name: "Pavel B. Novikov",
    rating: 160,
    level: 0,
    chat: "607c678f2d5da0006e55cacc",
    __v: 0,
    username: "@GavinBelson",
  },
  {
    _id: "608312b01cf8e5965115725c",
    userId: 323519943,
    name: "Sergey Qt",
    rating: 0,
    level: 0,
    chat: "607c678f2d5da0006e55cacc",
    __v: 0,
    username: "@sergey_qt",
  },
  {
    _id: "60832cee6cca71b004a740a2",
    userId: 100661714,
    name: "Сын маминой подруги",
    rating: -100,
    level: 0,
    chat: "607c678f2d5da0006e55cacc",
    __v: 0,
  },
  {
    _id: "608338dc81dcf7b37eab2d9d",
    userId: 416272904,
    name: "𝕐 ℕ",
    rating: -20,
    level: 0,
    chat: "607c678f2d5da0006e55cacc",
    __v: 0,
  },
  {
    _id: "60840ec17d1300f3056f3f87",
    userId: 360971649,
    name: "Alexey",
    rating: -60,
    level: 0,
    chat: "607c678f2d5da0006e55cacc",
    __v: 0,
  },
  {
    _id: "60846a1a2d76b93ef068aa84",
    userId: 133379700,
    name: "Valerii Gorbachev",
    username: "@darkdef_pr",
    rating: -20,
    level: 0,
    chat: "607c678f2d5da0006e55cacc",
    __v: 0,
  },
];

const createImage = (users: typeof testUsers, rates: typeof testRating) => {
  const nodeSize = 35;
  const width = 500;
  const height = users.length * nodeSize + 100;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const createText = (
    text: string | number,
    fontSize: number,
    coords: [x: number, y: number, max?: number],
    textAlign: CanvasTextDrawingStyles["textAlign"] = "left"
  ) => {
    ctx.font = `${fontSize}px Roboto`;
    ctx.textAlign = textAlign;
    ctx.fillStyle = "black";
    ctx.fillText(String(text), coords[0], coords[1], coords[2]);
  };
  const createLine = (
    from: [x: number, y: number],
    to: [x: number, y: number]
  ) => {
    ctx.beginPath();
    ctx.moveTo(from[0], from[1]);
    ctx.lineTo(to[0], to[1]);
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  /* Рисуем заголовок */
  createText("Рейтинг группы:", 20, [width / 2, 32.5], "center");

  /* Рисуем табличку */
  createLine([200, 100], [200, canvas.height]);
  createLine([300, 100], [300, canvas.height]);

  createText("Имя:", 16, [10, 85]);
  createText("Рейтинг:", 16, [210, 85]);
  createText("Звание:", 16, [310, 85]);

  users.forEach((_, i) => {
    createLine([0, 100 + i * nodeSize], [canvas.width, 100 + i * nodeSize]);
  });

  /* Заполняем табличку */

  users
    .sort((a, c) => c.rating - a.rating)
    .forEach((data, i) => {
      createText(data.name, 12, [10, 100 + i * nodeSize + 15, 180]);
      createText(data.username || "no_username", 10, [
        10,
        100 + i * nodeSize + 30,
      ]);
      createText(data.rating, 12, [210, 100 + i * nodeSize + 22.5]);
      const title = rates.find(
        ({ points }) => data.rating >= points.from && data.rating <= points.to
      );
      if (title) {
        createText(title.text, 12, [310, 100 + i * nodeSize + 22.5]);
      }
    });

  const png = canvas.toBuffer();
  require("fs").writeFile("out.png", png, "binnary", () => {});
};

createImage(testUsers, testRating);
