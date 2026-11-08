import { useCallback, useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';

/**
 * 导出 PNG Hook
 * 封装 html-to-image 调用、错误处理与加载状态
 */
export function useExportPng() {
  const exportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const exportPng = useCallback(async () => {
    const node = exportRef.current;
    if (!node || exporting) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        cacheBust: true,
        filter: (n) => !(n instanceof Element && n.hasAttribute('data-export-exclude')),
        style: { position: 'static', left: '0', top: '0', margin: '0' },
      });
      const link = document.createElement('a');
      const stamp = new Date();
      const pad2 = (n: number) => String(n).padStart(2, '0');
      link.download = `文本预览-${stamp.getFullYear()}${pad2(stamp.getMonth() + 1)}${pad2(stamp.getDate())}-${pad2(stamp.getHours())}${pad2(stamp.getMinutes())}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('已导出高清 PNG 长图');
    } catch (err) {
      console.error(err);
      toast.error('导出失败，请重试');
    } finally {
      setExporting(false);
    }
  }, [exporting]);

  return { exportRef, exporting, exportPng };
}
