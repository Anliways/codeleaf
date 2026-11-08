/**
 * 颜色校验与转换工具
 * 统一处理 hex、rgb/rgba、颜色关键字与 alpha 通道
 */

const NAMED_COLORS = new Set([
  'red',
  'green',
  'blue',
  'yellow',
  'orange',
  'purple',
  'pink',
  'black',
  'white',
  'gray',
  'grey',
  'cyan',
  'magenta',
  'lime',
  'teal',
  'indigo',
  'violet',
]);

/** 校验并标准化颜色值，非法时返回 null */
export const isValidColor = (raw: string): string | null => {
  const trimmed = raw.trim();
  if (trimmed === '') return null;

  if (trimmed.startsWith('#')) {
    const hex = trimmed.slice(1);
    if ([3, 4, 6, 8].includes(hex.length) && /^[0-9A-Fa-f]+$/.test(hex)) {
      return trimmed;
    }
    return null;
  }

  if (trimmed.startsWith('rgb(') || trimmed.startsWith('rgba(')) {
    return trimmed;
  }

  if (NAMED_COLORS.has(trimmed.toLowerCase())) {
    return trimmed;
  }
  return null;
};

/** 将 0-100 的透明度百分比转换为两位大写 HEX */
export const alphaToHex = (alpha: number): string =>
  Math.max(0, Math.min(100, Math.round(alpha * 2.55)))
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();

/** 拼接 HEX 与透明度（alpha=100 时省略） */
export const composeHex8 = (hex: string, alpha: number): string => {
  if (alpha >= 100) return hex;
  return `${hex}${alphaToHex(alpha)}`;
};

/** 棋盘格背景样式（用于颜色预览） */
export const CHECKERBOARD_BG =
  'linear-gradient(45deg, hsl(var(--border)) 25%, transparent 25%, transparent 75%, hsl(var(--border)) 75%), linear-gradient(45deg, hsl(var(--border)) 25%, transparent 25%, transparent 75%, hsl(var(--border)) 75%)';
