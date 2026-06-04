const GRID_SIZE = 25;

export function diceMultiplier(target, mode) {
  const winChance = mode === "under" ? target : 100 - target;
  if (winChance <= 0 || winChance >= 100) return 0;
  return +(99 / winChance).toFixed(4);
}

export function rollDice() {
  return +(Math.random() * 100).toFixed(2);
}

export function diceWins(roll, target, mode) {
  return mode === "under" ? roll < target : roll > target;
}

export function flipCoin() {
  return Math.random() < 0.5 ? "heads" : "tails";
}

export function generateMinePositions(count, gridSize = GRID_SIZE) {
  const positions = new Set();
  while (positions.size < count) {
    positions.add(Math.floor(Math.random() * gridSize));
  }
  return [...positions];
}

export function minesMultiplier(gridSize, mineCount, safeRevealed) {
  if (safeRevealed <= 0) return 1;
  return +Math.pow(gridSize / (gridSize - mineCount), safeRevealed).toFixed(4);
}

export { GRID_SIZE };
