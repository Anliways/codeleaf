import React from 'react';
import { Eye, Rows3, ImageDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import DimensionControls from './DimensionControls';
import PreviewCanvas from './PreviewCanvas';
import RenderedText from '@/lib/render';
import type { DevicePreset } from '@/lib/presets';

/**
 * 预览区组件
 * 包含头部工具栏、尺寸控制、画布与离屏导出节点
 */
interface PreviewSectionProps {
  width: number;
  height: number;
  text: string;
  scale: number;
  presets: DevicePreset[];
  activePresetId: string | null;
  onWidthChange: (v: number) => void;
  onHeightChange: (v: number) => void;
  onSelectPreset: (p: DevicePreset) => void;
  onSavePreset: (name: string) => void;
  autoFit: boolean;
  onToggleAutoFit: () => void;
  onManualZoom: (v: number) => void;
  tableCompact: boolean;
  onToggleTableCompact: () => void;
  exporting: boolean;
  onExport: () => void;
  searchTerm: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  exportRef: React.RefObject<HTMLDivElement | null>;
  onTouchStart: React.TouchEventHandler<HTMLDivElement>;
  onTouchEnd: React.TouchEventHandler<HTMLDivElement>;
}

export const PreviewSection: React.FC<PreviewSectionProps> = (props) => {
  return (
    <section id="preview" className="flex h-full min-h-0 min-w-0 flex-1 flex-col bg-card">
      <div className="flex h-10 shrink-0 items-center justify-between gap-2 border-b border-border px-3 md:px-5">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          预览区
        </span>
        <div className="flex min-w-0 shrink-0 items-center gap-2">
          <span className="hidden font-mono text-xs text-muted-foreground md:inline">
            {props.width}×{props.height}px · {Math.round(props.scale * 100)}%
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={props.tableCompact ? 'default' : 'ghost'}
                  size="sm"
                  className="h-7 gap-1.5 px-2 text-xs"
                  onClick={props.onToggleTableCompact}
                >
                  <Rows3 className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">紧凑表格</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {props.tableCompact
                    ? '恢复常规表格内边距'
                    : '缩减表格单元格内边距，提升数据密度'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            variant="secondary"
            size="sm"
            className="h-7 gap-1.5 px-2.5 text-xs"
            onClick={props.onExport}
            disabled={props.exporting}
          >
            {props.exporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ImageDown className="h-3.5 w-3.5" />
            )}
            {props.exporting ? '导出中' : '导出 PNG'}
          </Button>
        </div>
      </div>

      <DimensionControls
        width={props.width}
        height={props.height}
        presets={props.presets}
        activePresetId={props.activePresetId}
        onWidthChange={props.onWidthChange}
        onHeightChange={props.onHeightChange}
        onSelectPreset={props.onSelectPreset}
        onSavePreset={props.onSavePreset}
        autoFit={props.autoFit}
        scale={props.scale}
        onToggleAutoFit={props.onToggleAutoFit}
        onManualZoom={props.onManualZoom}
      />

      <div
        ref={props.containerRef}
        onTouchStart={props.onTouchStart}
        onTouchEnd={props.onTouchEnd}
        className="min-h-0 flex-1 overflow-auto bg-background/40 p-6"
      >
        <div className="flex min-h-full items-start justify-center">
          <PreviewCanvas
            width={props.width}
            height={props.height}
            text={props.text}
            scale={props.scale}
            searchTerm={props.searchTerm}
            tableCompact={props.tableCompact}
          />
        </div>
      </div>

      <div
        ref={props.exportRef}
        aria-hidden="true"
        className="pointer-events-none"
        style={{
          position: 'fixed',
          left: -10000,
          top: 0,
          width: props.width,
          backgroundColor: 'hsl(var(--background))',
        }}
      >
        <div className="px-5 py-4">
          <RenderedText text={props.text} />
        </div>
      </div>
    </section>
  );
};
