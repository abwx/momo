export function shuffleList<T>(items: T[]): T[] {
  const shuffledItems = [...items];
  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    swapItems(shuffledItems, index, getRandomIndex(index));
  }
  return shuffledItems;
}

function getRandomIndex(maxIndex: number) {
  return Math.floor(Math.random() * (maxIndex + 1));
}

function swapItems<T>(items: T[], leftIndex: number, rightIndex: number) {
  [items[leftIndex], items[rightIndex]] = [items[rightIndex], items[leftIndex]];
}
