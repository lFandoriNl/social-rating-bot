export function generateRankPoints(
  startPoint: number,
  multiple: number,
  countRanks: number
): Array<[number, number]> {
  const ranks: Array<[number, number]> = [];

  const countHalfRanks = Math.floor(countRanks / 2);

  let currentPoint = -startPoint;
  for (let i = 0; i < countHalfRanks; i++) {
    const nextPoint = -Math.abs(currentPoint) * multiple;
    ranks.unshift([nextPoint, -Math.abs(currentPoint) - 1]);
    currentPoint = nextPoint;
  }

  ranks.push([-startPoint, startPoint]);

  currentPoint = startPoint;
  for (let i = 0; i < countHalfRanks; i++) {
    const nextPoint = currentPoint * multiple;
    ranks.push([currentPoint + 1, nextPoint]);
    currentPoint = nextPoint;
  }

  return ranks.reverse();
}
