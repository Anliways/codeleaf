import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * 用 ResizeObserver 与 window resize 监听容器元素，
 * 将 canvasW×canvasH 的画布等比自适应缩放以适应容器可用空间所需的 scale 系数。
 * 针对窄屏、移动端及 iframe 预览视口做了鲁棒性保护与最小缩放保底。
 */
export function useContainerScale(
  canvasW: number,
  canvasH: number,
  enabled: boolean,
  paddingPx = 32,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScale, setAutoScale] = useState(1);

  const compute = useCallback(() => {
    const el = containerRef.current;
    if (!el || !enabled) return;

    // 动态根据容器宽度调整内边距扣除量，防止窄屏下 aw 算成负数
    const effectivePadding = Math.min(paddingPx, Math.max(8, el.clientWidth * 0.08));
    const aw = el.clientWidth - effectivePadding * 2;
    const ah = el.clientHeight - effectivePadding * 2;

    if (canvasW <= 0 || canvasH <= 0) return;

    // 若当前容器尚未布局完成（宽高为0），尝试通过父级视口后备计算或在下一帧重试
    if (aw <= 0 || ah <= 0) {
      const parentW = el.parentElement?.clientWidth || window.innerWidth;
      const parentH = el.parentElement?.clientHeight || window.innerHeight;
      const safeW = Math.max(120, parentW - effectivePadding * 2);
      const safeH = Math.max(120, parentH - effectivePadding * 2);
      const fallbackScale = Math.max(0.1, Math.min(safeW / canvasW, safeH / canvasH, 1));
      setAutoScale(fallbackScale);
      return;
    }

    const calculated = Math.min(aw / canvasW, ah / canvasH, 1);
    // 限制在安全区间 [0.05, 1]，避免为 0 导致画布不可见
    const clamped = Math.max(0.05, calculated);
    setAutoScale(clamped);
  }, [canvasW, canvasH, enabled, paddingPx]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // 挂载时立即执行一次，并用 rAF 双重确认
    compute();
    const rafId = requestAnimationFrame(compute);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        compute();
      });
      ro.observe(el);
      if (el.parentElement) {
        ro.observe(el.parentElement);
      }
    }

    window.addEventListener('resize', compute);

    return () => {
      cancelAnimationFrame(rafId);
      if (ro) ro.disconnect();
      window.removeEventListener('resize', compute);
    };
  }, [compute]);

  return { containerRef, autoScale };
}

