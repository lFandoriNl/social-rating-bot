type Point = { from: number; to: number };

type GenerateRankPoints = {
  startPoint: number;
  multiple: number;
  countRanks: number;
};

export function generateRankPoints({
  startPoint,
  multiple,
  countRanks,
}: GenerateRankPoints): Point[] {
  const ranks: Point[] = [];

  const countHalfRanks = Math.floor(countRanks / 2);

  let currentPoint = -startPoint;
  for (let i = 0; i < countHalfRanks; i++) {
    const nextPoint = Math.round(-Math.abs(currentPoint) * multiple);
    ranks.unshift({ from: nextPoint, to: -Math.abs(currentPoint) - 1 });
    currentPoint = nextPoint;
  }

  ranks.push({ from: -startPoint, to: startPoint });

  currentPoint = startPoint;
  for (let i = 0; i < countHalfRanks; i++) {
    const nextPoint = Math.round(currentPoint * multiple);
    ranks.push({ from: currentPoint + 1, to: nextPoint });
    currentPoint = nextPoint;
  }

  return ranks.reverse();
}
