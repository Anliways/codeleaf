/**
 * 编辑器选区与文本操作工具
 * 封装获取选区、替换选区、按行转换等通用逻辑，避免 TextPreviewer 中重复
 */

export interface TextSelection {
  start: number;
  end: number;
  before: string;
  selected: string;
  after: string;
}

/** 从 textarea 获取当前选区与三段文本 */
export const getSelection = (
  el: HTMLTextAreaElement,
  text: string,
): TextSelection => {
  const start = el.selectionStart ?? 0;
  const end = el.selectionEnd ?? 0;
  return {
    start,
    end,
    before: text.slice(0, start),
    selected: text.slice(start, end),
    after: text.slice(end),
  };
};

/** 聚焦并设置光标位置 */
export const focusCursor = (
  el: HTMLTextAreaElement | null,
  start: number,
  end: number = start,
) => {
  if (!el) return;
  requestAnimationFrame(() => {
    el.focus();
    el.setSelectionRange(start, end);
  });
};

/** 获取选区覆盖的完整行范围索引 */
export const getLineRange = (text: string, start: number, end: number) => {
  const lineStart = text.lastIndexOf('\n', start - 1) + 1;
  let lineEnd = text.indexOf('\n', end);
  if (lineEnd === -1) lineEnd = text.length;
  return { lineStart, lineEnd };
};

/** 对选区每行应用转换函数 */
export const transformSelectedLines = (
  text: string,
  start: number,
  end: number,
  transform: (line: string, index: number) => string,
): { newText: string; rangeStart: number; rangeEnd: number } => {
  const { lineStart, lineEnd } = getLineRange(text, start, end);
  const raw = text.slice(lineStart, lineEnd);
  const converted = raw.split('\n').map(transform).join('\n');
  const newText = text.slice(0, lineStart) + converted + text.slice(lineEnd);
  return { newText, rangeStart: lineStart, rangeEnd: lineStart + converted.length };
};
