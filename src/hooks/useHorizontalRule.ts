import { useMemo, useState } from 'react';
import type { Align } from '@/lib/render';

/**
 * 水平分割线配置 Hook
 * 管理模式、文字、对齐与自定义颜色，并生成对应语法串
 */
export function useHorizontalRule() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'line' | 'text'>('line');
  const [text, setText] = useState('分割线');
  const [align, setAlign] = useState<Exclude<Align, 'justify'>>('center');
  const [customLine, setCustomLine] = useState(false);
  const [customText, setCustomText] = useState(false);
  const [lineColor, setLineColor] = useState('#E4E4E7');
  const [textColor, setTextColor] = useState('#71717A');

  const syntax = useMemo(() => {
    const attrs: string[] = [];
    if (customLine) attrs.push(`line=${lineColor}`);
    if (mode === 'text') {
      if (customText) attrs.push(`text=${textColor}`);
      if (align !== 'center') attrs.push(`align=${align}`);
    }
    const attrStr = attrs.length > 0 ? ` [${attrs.join(' ')}]` : '';
    const label = mode === 'text' ? text.trim() || '分割线' : '';
    return `--- ${label}${attrStr}`.trim();
  }, [mode, text, align, customLine, customText, lineColor, textColor]);

  return {
    open,
    setOpen,
    mode,
    setMode,
    text,
    setText,
    align,
    setAlign,
    customLine,
    setCustomLine,
    customText,
    setCustomText,
    lineColor,
    setLineColor,
    textColor,
    setTextColor,
    syntax,
  };
}
