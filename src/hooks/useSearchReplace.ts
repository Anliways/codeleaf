import { useMemo, useState, useCallback, useRef } from 'react';

/**
 * 查找替换 Hook
 * 封装匹配索引计算、当前匹配定位与替换逻辑
 * 通过 refs 在回调中访问 textarea 与 scroller，避免闭包陈旧
 */
export function useSearchReplace(
  text: string,
  onChange: (next: string) => void,
  textareaRef: React.RefObject<HTMLTextAreaElement | null>,
  scrollerRef: React.RefObject<HTMLDivElement | null>,
) {
  const [open, setOpen] = useState(false);
  const [term, setTermRaw] = useState('');
  const [replaceWith, setReplaceWith] = useState('');
  const [cursor, setCursor] = useState(0);
  const cursorRef = useRef(0);
  cursorRef.current = cursor;

  const setTerm = useCallback((v: string) => {
    setTermRaw(v);
    setCursor(0);
  }, []);

  const matches = useMemo(() => {
    if (!term) return [] as number[];
    const result: number[] = [];
    const lower = text.toLowerCase();
    const needle = term.toLowerCase();
    let idx = lower.indexOf(needle);
    while (idx !== -1) {
      result.push(idx);
      idx = lower.indexOf(needle, idx + needle.length);
    }
    return result;
  }, [text, term]);

  const count = matches.length;
  const currentNo = count === 0 ? 0 : (cursor % count) + 1;

  const jump = useCallback(
    (dir: 1 | -1) => {
      if (count === 0) return;
      const current = cursorRef.current;
      const next = (((current + dir) % count) + count) % count;
      setCursor(next);
      const pos = matches[next];
      const textarea = textareaRef.current;
      const scroller = scrollerRef.current;
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(pos, pos + term.length);
      }
      if (scroller) {
        const lineIdx = text.slice(0, pos).split('\n').length - 1;
        scroller.scrollTop = Math.max(0, 16 + lineIdx * 24 - scroller.clientHeight / 2);
      }
    },
    [count, matches, term.length, text, textareaRef, scrollerRef],
  );

  const replaceCurrent = useCallback(() => {
    if (count === 0) return;
    const idx = matches[cursorRef.current % count];
    onChange(text.slice(0, idx) + replaceWith + text.slice(idx + term.length));
    const textarea = textareaRef.current;
    if (textarea) {
      const end = idx + replaceWith.length;
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(end, end);
      });
    }
  }, [count, matches, onChange, replaceWith, term, text, textareaRef]);

  const replaceAll = useCallback(() => {
    if (!term || count === 0) return;
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    onChange(text.replace(new RegExp(escaped, 'gi'), replaceWith));
    setCursor(0);
  }, [count, onChange, replaceWith, term, text]);

  const close = useCallback(() => {
    setOpen(false);
    setTerm('');
    setReplaceWith('');
    setCursor(0);
  }, []);

  const openSearch = useCallback(() => setOpen(true), []);

  return {
    open,
    term,
    setTerm,
    replaceWith,
    setReplaceWith,
    count,
    currentNo,
    jump,
    replaceCurrent,
    replaceAll,
    close,
    openSearch,
  };
}
