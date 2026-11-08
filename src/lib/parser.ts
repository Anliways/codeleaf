import type { Align, Block } from './types';
import { isValidColor } from './color';

/**
 * 块级语法解析器
 * 将 Markdown / 自定义标签文本拆分为 Block 数组，供渲染器消费
 */

// 列表行标记：无序(-*+)、有序编号、或自定义符号
export const LIST_MARKER_RE =
  /^(\d{1,3}[.)]|[ivxlcdm]{2,4}[.)]|[IVXLCDM]{2,4}[.)]|[a-z][.)]|[A-Z][.)]|[-*+]|[●○☆★◆◇■□▲△▼▽※•†‡✦✧➤➢♪♥♦♣♠☐☑✓✔✗✘])\s+/;

// Markdown 表格分隔行：| --- | :--- | :---: | ---: |
export const TABLE_SEPARATOR_RE =
  /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?$/;

// 任务列表项：[ ] 未完成 / [x] 已完成
export const TASK_ITEM_RE = /^\[([ xX])\]\s+(.*)$/;

/** 拆分列表行的标记与内容 */
export const splitListMarker = (
  line: string,
): { marker: string | null; content: string } => {
  const m = LIST_MARKER_RE.exec(line);
  if (!m) return { marker: null, content: line };
  const content = line.slice(m[0].length);
  if (['-', '*', '+'].includes(m[1])) {
    return { marker: null, content };
  }
  return { marker: m[1], content };
};

/** 剥离行首对齐标记 :left / :center / :right / :justify */
export const stripAlign = (line: string): { align?: Align; content: string } => {
  const m = /^:(left|center|right|justify)\s+/.exec(line);
  if (!m) return { content: line };
  return { align: m[1] as Align, content: line.slice(m[0].length) };
};

/** 拆分表格行 */
export const splitTableRow = (row: string): string[] => {
  let s = row.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|')) s = s.slice(0, -1);
  return s.split('|').map((c) => c.trim());
};

/** 解析表格分隔行中的对齐标记 */
export const parseSepAlign = (cell: string): Align | undefined => {
  const t = cell.trim();
  const left = t.startsWith(':');
  const right = t.endsWith(':');
  if (left && right) return 'center';
  if (right) return 'right';
  return left ? 'left' : undefined;
};

/** 解析容器块属性（颜色等） */
const parseHrAttrs = (
  attrStr: string,
): { lineColor?: string; textColor?: string; align?: Align } => {
  const result: { lineColor?: string; textColor?: string; align?: Align } = {};
  const pairs = attrStr.split(/\s+/).filter(Boolean);
  for (const pair of pairs) {
    const m = /^(line|text|align)=(\S+)$/.exec(pair);
    if (!m) continue;
    if (m[1] === 'line') {
      const c = isValidColor(m[2]);
      if (c) result.lineColor = c;
    } else if (m[1] === 'text') {
      const c = isValidColor(m[2]);
      if (c) result.textColor = c;
    } else if (['left', 'center', 'right'].includes(m[2])) {
      result.align = m[2] as Align;
    }
  }
  return result;
};

/** 主解析函数：将文本拆分为 Block 数组 */
export function parseBlocks(text: string): Block[] {
  const lines = text.split('\n');
  const blocks: Block[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trimEnd();

    // 代码块
    const codeFence = /^```\s*(\S*)\s*$/.exec(line.trimStart());
    if (codeFence) {
      const lang = codeFence[1] || '';
      const inner: string[] = [];
      i++;
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) {
        inner.push(lines[i]);
        i++;
      }
      blocks.push({ type: 'code', text: inner.join('\n'), codeLang: lang });
      continue;
    }

    // 容器块
    const fence = /^:::\s*(columns|card|highlight)(?:\s+(.*))?$/.exec(line);
    if (fence) {
      const kind = fence[1] as 'columns' | 'card' | 'highlight';
      const title = fence[2]?.trim();
      const inner: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== ':::') {
        inner.push(lines[i]);
        i++;
      }
      blocks.push({
        type: 'container',
        text: '',
        containerKind: kind,
        containerTitle: title,
        containerLines: inner,
      });
      continue;
    }

    // 引用块
    if (/^>\s?/.test(line)) {
      const quoteLines: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i].trimEnd())) {
        quoteLines.push(lines[i].trimEnd().replace(/^>\s?/, ''));
        i++;
      }
      i--;
      blocks.push({ type: 'quote', text: '', quoteLines });
      continue;
    }

    // 表格
    if (
      line.includes('|') &&
      i + 1 < lines.length &&
      TABLE_SEPARATOR_RE.test(lines[i + 1].trim())
    ) {
      const header = splitTableRow(line);
      const aligns = splitTableRow(lines[i + 1].trim()).map(parseSepAlign);
      const rows: string[][] = [];
      i += 2;
      while (
        i < lines.length &&
        lines[i].trim() !== '' &&
        lines[i].includes('|')
      ) {
        rows.push(splitTableRow(lines[i].trimEnd()));
        i++;
      }
      i--;
      blocks.push({
        type: 'table',
        text: '',
        tableHeader: header,
        tableRows: rows,
        tableAligns: aligns,
      });
      continue;
    }

    const { align, content } = stripAlign(line);

    // 分割线
    const hrMatch = /^(-{3}|\*{3}|_{3})(?:\s+(.*))?$/.exec(content);
    if (hrMatch) {
      let rest = (hrMatch[2] ?? '').trim();
      let hrLineColor: string | undefined;
      let hrTextColor: string | undefined;
      let hrAlign: Align | undefined = align;

      const attrMatch = /\[([^\]]*)\]\s*$/.exec(rest);
      if (attrMatch) {
        const pairs = attrMatch[1].split(/\s+/).filter(Boolean);
        const allValid =
          pairs.length > 0 && pairs.every((p) => /^(line|text|align)=\S+$/.test(p));
        if (allValid) {
          rest = rest.slice(0, attrMatch.index).trim();
          const attrs = parseHrAttrs(attrMatch[1]);
          hrLineColor = attrs.lineColor;
          hrTextColor = attrs.textColor;
          hrAlign = attrs.align ?? hrAlign;
        }
      }
      blocks.push({ type: 'hr', text: rest, align: hrAlign, hrLineColor, hrTextColor });
      continue;
    }

    // 图片
    const imageMatch = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(content);
    if (imageMatch) {
      blocks.push({
        type: 'image',
        text: '',
        imageAlt: imageMatch[1],
        imageUrl: imageMatch[2],
        align,
      });
      continue;
    }

    // 标题 / 列表 / 段落
    if (content.startsWith('###### ')) {
      blocks.push({ type: 'h6', text: content.slice(7), align });
    } else if (content.startsWith('##### ')) {
      blocks.push({ type: 'h5', text: content.slice(6), align });
    } else if (content.startsWith('#### ')) {
      blocks.push({ type: 'h4', text: content.slice(5), align });
    } else if (content.startsWith('### ')) {
      blocks.push({ type: 'h3', text: content.slice(4), align });
    } else if (content.startsWith('## ')) {
      blocks.push({ type: 'h2', text: content.slice(3), align });
    } else if (content.startsWith('# ')) {
      blocks.push({ type: 'h1', text: content.slice(2), align });
    } else if (LIST_MARKER_RE.test(content)) {
      blocks.push({ type: 'li', text: content, align });
    } else {
      blocks.push({ type: 'p', text: content, align });
    }
  }
  return blocks;
}
