import type { Segment, SegmentStyle } from './types';
import { isValidColor } from './color';

/**
 * 行内标签解析
 * 支持 <color=> <size=> <b> <i> <u> <s> <sup> <sub> <spacing=> <lh=> <font=> <weight=>
 */

const INLINE_TAG_RE =
  /<(\/?)(color|size|b|i|u|s|sup|sub|spacing|lh|font|weight)(?:=([^>]*))?>/i;

/** 在文本中查找 tagName 的配对的闭合标签（支持同名嵌套） */
export const extractInner = (
  text: string,
  tagName: string,
): { inner: string; closeTag: string } | null => {
  const re = new RegExp(`<(/?)${tagName}(?:=[^>]*)?>`, 'gi');
  let depth = 1;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    depth += m[1] === '/' ? -1 : 1;
    if (depth === 0) {
      return { inner: text.slice(0, m.index), closeTag: m[0] };
    }
  }
  return null;
};

/** 判断样式对象是否包含任何生效样式 */
export const hasSegmentStyle = (s: SegmentStyle): boolean =>
  s.color !== undefined ||
  s.fontSize !== undefined ||
  s.bold ||
  s.italic ||
  s.underline ||
  s.strikethrough ||
  s.superscript ||
  s.subscript ||
  s.letterSpacing !== undefined ||
  s.lineHeight !== undefined ||
  s.fontFamily !== undefined ||
  s.fontWeight !== undefined;

/** 递归解析行内富文本标签 */
export function parseInline(text: string, style: SegmentStyle): Segment[] {
  const segments: Segment[] = [];
  let pos = 0;

  while (pos < text.length) {
    const rest = text.slice(pos);
    const match = INLINE_TAG_RE.exec(rest);
    if (!match) {
      segments.push({ text: rest, style });
      break;
    }

    const before = rest.slice(0, match.index);
    if (before.length > 0) {
      segments.push({ text: before, style });
    }

    // 多余的闭合标签按普通文本展示
    if (match[1] === '/') {
      segments.push({ text: match[0], style });
      pos += match.index + match[0].length;
      continue;
    }

    const tagName = match[2].toLowerCase();
    const value = (match[3] ?? '').trim();
    const afterOpen = rest.slice(match.index + match[0].length);
    const closed = extractInner(afterOpen, tagName);

    if (!closed) {
      segments.push({ text: rest, style });
      break;
    }

    const child: SegmentStyle = { ...style };
    let valid = true;
    switch (tagName) {
      case 'color': {
        const color = isValidColor(value);
        if (color) child.color = color;
        else valid = false;
        break;
      }
      case 'size': {
        const n = Number(value);
        if (Number.isFinite(n) && n > 0) child.fontSize = n;
        else valid = false;
        break;
      }
      case 'b':
        child.bold = true;
        break;
      case 'i':
        child.italic = true;
        break;
      case 'u':
        child.underline = true;
        break;
      case 's':
        child.strikethrough = true;
        break;
      case 'sup':
        child.superscript = true;
        break;
      case 'sub':
        child.subscript = true;
        break;
      case 'spacing': {
        const n = Number(value);
        if (Number.isFinite(n) && n >= 0 && n <= 20) child.letterSpacing = n;
        else valid = false;
        break;
      }
      case 'lh': {
        const n = Number(value);
        if (Number.isFinite(n) && n > 0 && n <= 5) child.lineHeight = n;
        else valid = false;
        break;
      }
      case 'font': {
        if (value.length > 0) child.fontFamily = value;
        else valid = false;
        break;
      }
      case 'weight': {
        const n = Number(value);
        if (Number.isFinite(n) && n >= 100 && n <= 900) child.fontWeight = n;
        else valid = false;
        break;
      }
    }

    if (valid) {
      segments.push(...parseInline(closed.inner, child));
    } else {
      // 属性非法时，整个标签按普通文本展示
      segments.push({ text: match[0] + closed.inner + closed.closeTag, style });
    }
    pos +=
      match.index + match[0].length + closed.inner.length + closed.closeTag.length;
  }

  return segments;
}
