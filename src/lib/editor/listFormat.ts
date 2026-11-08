/**
 * 列表序号格式化工具
 */

const ROMAN_MAP: [number, string][] = [
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
];

export const toRoman = (n: number, upper: boolean): string => {
  let result = '';
  let num = n;
  for (const [v, s] of ROMAN_MAP) {
    while (num >= v) {
      result += s;
      num -= v;
    }
  }
  return upper ? result : result.toLowerCase();
};

export const toLetters = (n: number, upper: boolean): string => {
  let result = '';
  let num = n;
  while (num > 0) {
    const rem = (num - 1) % 26;
    result = String.fromCharCode(65 + rem) + result;
    num = Math.floor((num - 1) / 26);
  }
  return upper ? result : result.toLowerCase();
};
