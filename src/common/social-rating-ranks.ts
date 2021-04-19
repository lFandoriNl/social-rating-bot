import { generateRankPoints } from "../lib/rank-points";

const rankPoints = generateRankPoints(60, 2, 9);

type SocialRatingRank = {
  level: number;
  text: string;
  points: [number, number];
};

export const socialRatingRanks: SocialRatingRank[] = [
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
    text: "Известный",
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
    text: "Ублюдок",
  },
  {
    level: -3,
    text: "Ненавистник",
  },
  {
    level: -4,
    text: "Исчадие ада",
  },
].map((rank, idx) => ({ ...rank, points: rankPoints[idx] }));

export function getRangByRating(rating: number) {
  const ranks = socialRatingRanks;

  if (ranks[0].points[1] < rating) {
    return ranks[0];
  }

  if (ranks[ranks.length - 1].points[0] > rating) {
    return ranks[ranks.length - 1];
  }

  return ranks.find(
    ({ points: [from, to] }) => from <= rating && rating <= to
  )!;
}
