import React from 'react';
import { Eye } from 'lucide-react';
import RenderedText from '@/lib/render';

interface PreviewCanvasProps {
  width: number;
  height: number;
  text: string;
  scale?: number;
  /** 查找关键词：非空时画布内匹配文本高亮 */
  searchTerm?: string;
  /** 表格紧凑模式：缩减单元格内边距 */
  tableCompact?: boolean;
}

const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  width,
  height,
  text,
  scale = 1,
  searchTerm = '',
  tableCompact = false,
}) => {
  const isEmpty = text.trim() === '';
  return (
    // 外层：在布局中占据缩放后的实际空间，防止撑破容器
    <div
      style={{ width: width * scale, height: height * scale }}
      className="relative shrink-0"
    >
      {/* 内层：按设备原始尺寸渲染，再用 CSS scale 等比缩放 */}
      <div
        style={{
          width,
          height,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          position: 'absolute',
          top: 0,
          left: 0,
          // 画布统一使用应用默认底色
          backgroundColor: 'hsl(var(--background))',
        }}
        className="overflow-hidden rounded-lg border border-border shadow-lg"
      >
        {isEmpty ? (
          // 空状态：简约引导插画（纯图标+语义色，与编辑区空状态风格统一）
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-muted/60">
              <Eye className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">预览区等待内容</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              在编辑区输入文本后，这里会实时渲染排版效果；右上角可将成品导出为 PNG 长图。
            </p>
          </div>
        ) : (
          <div className="h-full w-full overflow-y-auto">
            <div className="px-5 py-4">
              <RenderedText text={text} searchTerm={searchTerm} tableCompact={tableCompact} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewCanvas;