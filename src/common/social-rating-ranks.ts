import { generateRankPoints } from "../lib/rank-points";

const rankPoints = generateRankPoints({
  startPoint: 40,
  multiplePositive: 1.7,
  multipleNegative: 1.7,
  countRanks: 13,
});

export const socialRatingRanks = [
  {
    level: 6,
    text: "Покровитель ЦП",
  },
  {
    level: 5,
    text: "Друг Антона",
  },
  {
    level: 4,
    text: "Элита",
  },
  {
    level: 3,
    text: "Знаменитый",
  },
  {
    level: 2,
    text: "Подлиза",
  },
  {
    level: 1,
    text: "Узнаваемый",
  },
  {
    level: 0,
    text: "Обыватель",
  },
  {
    level: -1,
    text: "Проходимец",
  },
  {
    level: -2,
    text: "Душнила",
  },
  {
    level: -3,
    text: "Ненавистник",
  },
  {
    level: -4,
    text: "Украинец 🇺🇦",
  },
  {
    level: -5,
    text: "Дно",
  },
  {
    level: -6,
    text: "Хейтер ЦП",
  },
].map((rank, idx) => ({ ...rank, points: rankPoints[idx] }));

export function getRangByRating(rating: number) {
  const ranks = socialRatingRanks;

  if (ranks[0].points.from < rating) {
    return ranks[0];
  }

  if (ranks[ranks.length - 1].points.from > rating) {
    return ranks[ranks.length - 1];
  }

  return ranks.find(
    ({ points: { from, to } }) => from <= rating && rating <= to
  )!;
}
