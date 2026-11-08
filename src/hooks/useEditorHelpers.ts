import { useMemo, useRef } from 'react';

/**
 * 行号 Hook
 * 从文本计算行数与行号数组，useMemo 缓存避免每次渲染重复切割
 */
export function useLineNumbers(text: string) {
  const count = useMemo(() => text.split('\n').length, [text]);
  const numbers = useMemo(
    () => Array.from({ length: count }, (_, i) => i + 1),
    [count],
  );
  return { lineCount: count, lineNumbers: numbers };
}

/**
 * 视图状态保存 Hook
 * 切换视图时保存/恢复滚动位置与编辑光标，实现无缝续读
 */
export function useSavedViewState() {
  const editorState = useRef({ scrollTop: 0, selectionStart: 0, selectionEnd: 0 });
  const previewScroll = useRef(0);

  const saveEditor = (
    scrollEl: HTMLDivElement | null,
    textarea: HTMLTextAreaElement | null,
  ) => {
    editorState.current = {
      scrollTop: scrollEl?.scrollTop ?? 0,
      selectionStart: textarea?.selectionStart ?? 0,
      selectionEnd: textarea?.selectionEnd ?? 0,
    };
  };

  const savePreview = (el: HTMLDivElement | null) => {
    previewScroll.current = el?.scrollTop ?? 0;
  };

  const restoreEditor = (
    scrollEl: HTMLDivElement | null,
    textarea: HTMLTextAreaElement | null,
  ) => {
    const s = editorState.current;
    if (scrollEl) scrollEl.scrollTop = s.scrollTop;
    if (textarea) textarea.setSelectionRange(s.selectionStart, s.selectionEnd);
  };

  const restorePreview = (el: HTMLDivElement | null) => {
    if (el) el.scrollTop = previewScroll.current;
  };

  return { saveEditor, savePreview, restoreEditor, restorePreview };
}
