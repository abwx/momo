export function moveListItem<T>(list: T[], index: number, offset: number): T[] {
  const targetIndex = index + offset;
  if (targetIndex < 0 || targetIndex >= list.length) return list;
  const nextList = [...list];
  [nextList[index], nextList[targetIndex]] = [nextList[targetIndex], nextList[index]];
  return nextList;
}
