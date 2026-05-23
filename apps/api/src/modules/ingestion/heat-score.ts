export function calculateRecencyScore(publishTime: Date, now = new Date()): number {
  const ageHours = Math.max(0, now.getTime() - publishTime.getTime()) / 3_600_000;

  if (ageHours <= 1) return 100;
  if (ageHours <= 6) return 80;
  if (ageHours <= 24) return 60;
  if (ageHours <= 72) return 30;
  return 10;
}

export function calculateTokenMoveScore(changes: number[]): number {
  const maxMove = Math.max(0, ...changes.map((change) => Math.abs(change)));

  if (maxMove >= 10) return 100;
  if (maxMove >= 5) return 70;
  if (maxMove >= 2) return 40;
  return 0;
}

export function calculateHeatScore(input: {
  publishTime: Date;
  sourceWeight: number;
  tokenMoves: number[];
  now?: Date;
}): number {
  const recencyScore = calculateRecencyScore(input.publishTime, input.now);
  const tokenMoveScore = calculateTokenMoveScore(input.tokenMoves);

  return Math.round(recencyScore * 0.45 + input.sourceWeight * 0.3 + tokenMoveScore * 0.25);
}
