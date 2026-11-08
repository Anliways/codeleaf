import { useEffect } from 'react';

/**
 * textarea 高度自适应 Hook
 * 监听内容变化与容器尺寸变化，自动撑高 textarea，由外层统一滚动
 */
export function useTextareaAutosize(
  textareaRef: React.RefObject<HTMLTextAreaElement | null>,
  scrollerRef: React.RefObject<HTMLDivElement | null>,
  text: string,
) {
  useEffect(() => {
    const el = textareaRef.current;
    const scroller = scrollerRef.current;
    if (!el || !scroller) return;

    const fit = () => {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    };
    fit();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(fit);
      ro.observe(scroller);
    }

    return () => {
      if (ro) ro.disconnect();
    };
  }, [text, textareaRef, scrollerRef]);
}
