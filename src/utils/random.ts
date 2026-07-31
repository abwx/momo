let randomSource: (() => number) | null = null;
let randomModifier = 0;

export function setRandomSource(source?: () => number): void {
  randomSource = source || null;
}

export function getRandomValue(): number {
  const value = randomSource ? randomSource() : Math.random();
  return Math.max(0, Math.min(0.999999, value - randomModifier));
}

export function withRandomModifier<T>(modifier: number, action: () => T): T {
  const previousModifier = randomModifier;
  randomModifier = Math.max(-0.95, Math.min(0.95, modifier));
  try { return action(); } finally { randomModifier = previousModifier; }
}

export function shuffleList<T>(items: T[]): T[] {
  const shuffledItems = [...items];
  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    swapItems(shuffledItems, index, getRandomIndex(index));
  }
  return shuffledItems;
}

function getRandomIndex(maxIndex: number) {
  return Math.floor(getRandomValue() * (maxIndex + 1));
}

function swapItems<T>(items: T[], leftIndex: number, rightIndex: number) {
  [items[leftIndex], items[rightIndex]] = [items[rightIndex], items[leftIndex]];
}
