export function randomRange(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function percentChance(per: number) {
  const randPer = randomRange(1, 101);
  return randPer <= per;
}

export function takeRandomValues<T>(list: T[], count: number): T[] {
  const result: T[] = [];

  new Array(count).fill(0).reduce<T[]>((acc) => {
    const index = randomRange(0, acc.length - 1);

    if (acc[index]) {
      result.push(acc[index]);
    }

    return acc.filter((_, idx) => idx !== index);
  }, list);

  return result;
}
