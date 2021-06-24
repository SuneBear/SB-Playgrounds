export function spliceOne(list, index) {
  for (; index + 1 < list.length; index++) list[index] = list[index + 1];
  list.pop();
}

export function newArray(n, fill = 0) {
  const array = new Array(n);
  for (let i = 0; i < n; i++) array[i] = fill;
  return array;
}

export function spliceObject(list, object) {
  const idx = list.indexOf(object);
  if (idx >= 0) spliceOne(list, idx);
}
