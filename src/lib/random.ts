export function randomRange(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function percentChance(per: number) {
  const randPer = randomRange(1, 101);
  return randPer <= per;
}
