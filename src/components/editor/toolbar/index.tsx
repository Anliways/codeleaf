import React from 'react';
import {
  Heading,
  AlignLeft,
  Type,
  Baseline,
  Rows3,
  Plus,
  ListOrdered,
  LayoutTemplate,
  Search,
  ImagePlus,
  Loader2,
  Undo2,
  Redo2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Slider } from '@/components/ui/slider';
import { ToolbarButton, ToolbarDivider } from './ToolbarButton';
import { ColorPicker } from './ColorPicker';
import { HrPopover } from './HrPopover';
import FontPanel from '@/components/editor/FontPanel';
import {
  HEADING_LEVELS,
  LIST_STYLES,
  INSERT_BLOCKS,
  ALIGN_OPTIONS,
  MIN_FONT_SIZE,
  MAX_FONT_SIZE,
  MIN_SPACING,
  MAX_SPACING,
  MIN_LINE_HEIGHT,
  MAX_LINE_HEIGHT,
  type ListStyleId,
  type AlignId,
} from '@/lib/editor/constants';

/**
 * 工具栏总装组件
 * 接收各类状态与回调，渲染可自动换行的完整工具栏
 */
interface ToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  insertTag: (snippet: string) => void;
  onToggleItalic: () => void;
  onApplyHeading: (level: number) => void;
  onApplyListStyle: (id: ListStyleId) => void;
  onApplyAlignment: (id: AlignId) => void;
  onClearFormat: () => void;
  onApplyFontSize: (size: number) => void;
  onApplyValueTag: (tag: string, value: number) => void;
  onApplyFont: (family: string) => void;
  onApplyWeight: (weight: number) => void;
  onInsertHr: () => void;
  onOpenTemplates: () => void;
  searchOpen: boolean;
  onToggleSearch: () => void;
  onImageClick: () => void;
  uploadingImage: boolean;
  fontSize: number;
  setFontSize: (v: number) => void;
  letterSpacing: number;
  setLetterSpacing: (v: number) => void;
  lineHeightVal: number;
  setLineHeightVal: (v: number) => void;
  customHex: string;
  customAlpha: number;
  setCustomHex: (v: string) => void;
  setCustomAlpha: (v: number) => void;
  hr: {
    open: boolean;
    setOpen: (v: boolean) => void;
    mode: 'line' | 'text';
    setMode: (v: 'line' | 'text') => void;
    text: string;
    setText: (v: string) => void;
    align: Exclude<AlignId, 'justify'>;
    setAlign: (v: Exclude<AlignId, 'justify'>) => void;
    customLine: boolean;
    setCustomLine: (v: boolean) => void;
    customText: boolean;
    setCustomText: (v: boolean) => void;
    lineColor: string;
    setLineColor: (v: string) => void;
    textColor: string;
    setTextColor: (v: string) => void;
    syntax: string;
  };
}

export const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { hr } = props;

  return (
    <div className="flex min-h-10 shrink-0 flex-nowrap items-center gap-x-3 gap-y-1.5 overflow-x-auto border-b border-border px-3 py-1.5 [scrollbar-width:none] md:flex-wrap md:overflow-visible md:px-5 [&::-webkit-scrollbar]:hidden">
      <span className="shrink-0 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        编辑区
      </span>
      <div className="flex min-w-0 flex-nowrap items-center gap-1 md:flex-wrap">
        <ToolbarButton
          icon={<Undo2 className="h-3.5 w-3.5" />}
          tooltip="撤销（Ctrl/Cmd+Z）"
          disabled={!props.canUndo}
          onClick={props.onUndo}
        />
        <ToolbarButton
          icon={<Redo2 className="h-3.5 w-3.5" />}
          tooltip="重做（Ctrl/Cmd+Shift+Z）"
          disabled={!props.canRedo}
          onClick={props.onRedo}
        />

        <ToolbarDivider />

        <TooltipProvider>
          <Tooltip>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <Heading className="h-3.5 w-3.5" />
                    标题
                  </button>
                </TooltipTrigger>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="start" className="w-36">
                {HEADING_LEVELS.map((h) => (
                  <DropdownMenuItem
                    key={h.level}
                    className="cursor-pointer text-xs"
                    onClick={() => props.onApplyHeading(h.level)}
                  >
                    {h.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <TooltipContent>
              <p>设置所选行的标题级别</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <ToolbarDivider />

        <ToolbarButton
          icon={<span className="text-xs font-bold">B</span>}
          tooltip="加粗"
          onClick={() => props.insertTag('<b>内容</b>')}
        />
        <ToolbarButton
          icon={<span className="text-xs italic">I</span>}
          tooltip="斜体（Ctrl/Cmd+I），再次点击取消"
          onClick={props.onToggleItalic}
        />
        <ToolbarButton
          icon={<span className="text-xs underline">U</span>}
          tooltip="下划线"
          onClick={() => props.insertTag('<u>内容</u>')}
        />
        <ToolbarButton
          icon={<span className="text-xs line-through">S</span>}
          tooltip="删除线"
          onClick={() => props.insertTag('<s>内容</s>')}
        />

        <div className="flex flex-wrap items-center gap-1">
          <ToolbarButton
            icon={<span className="text-[10px]">x²</span>}
            tooltip="上标"
            onClick={() => props.insertTag('<sup>内容</sup>')}
          />
          <ToolbarButton
            icon={<span className="text-[10px]">x₂</span>}
            tooltip="下标"
            onClick={() => props.insertTag('<sub>内容</sub>')}
          />
        </div>

        <ToolbarDivider />

        <div className="flex flex-wrap items-center gap-1">
          <ColorPicker
            hex={props.customHex}
            alpha={props.customAlpha}
            onHexChange={props.setCustomHex}
            onAlphaChange={props.setCustomAlpha}
            onApply={(value) => props.insertTag(`<color=${value}>内容</color>`)}
          />
          <ValuePopover
            icon={<Type className="h-3.5 w-3.5" />}
            label="字号"
            value={props.fontSize}
            min={MIN_FONT_SIZE}
            max={MAX_FONT_SIZE}
            step={1}
            suffix="px"
            onChange={props.setFontSize}
            onCommit={props.onApplyFontSize}
            tooltip="字号滑块：拖动后应用到选中文本"
          />
        </div>

        <div className="flex flex-wrap items-center">
          <ToolbarButton
            icon={<span className="text-xs">清除格式</span>}
            tooltip="移除选中文本的所有标签格式"
            onClick={props.onClearFormat}
          />
        </div>

        <ToolbarDivider />

        <HrPopover
          open={hr.open}
          onOpenChange={hr.setOpen}
          mode={hr.mode}
          setMode={hr.setMode}
          text={hr.text}
          setText={hr.setText}
          align={hr.align}
          setAlign={hr.setAlign}
          customLine={hr.customLine}
          setCustomLine={hr.setCustomLine}
          customText={hr.customText}
          setCustomText={hr.setCustomText}
          lineColor={hr.lineColor}
          setLineColor={hr.setLineColor}
          textColor={hr.textColor}
          setTextColor={hr.setTextColor}
          syntax={hr.syntax}
          onInsert={() => {
            props.onInsertHr();
            hr.setOpen(false);
          }}
        />

        <ToolbarButton
          icon={props.uploadingImage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
          tooltip="上传本地图片"
          disabled={props.uploadingImage}
          onClick={props.onImageClick}
        />

        <ToolbarDivider />

        <div className="flex flex-wrap items-center gap-1">
          <ValuePopover
            icon={<Baseline className="h-3.5 w-3.5" />}
            label="字距"
            value={props.letterSpacing}
            min={MIN_SPACING}
            max={MAX_SPACING}
            step={0.5}
            suffix="px"
            onChange={props.setLetterSpacing}
            onCommit={(v) => props.onApplyValueTag('spacing', v)}
            tooltip="字符间距滑块：松手后应用到选中文本"
          />
          <ValuePopover
            icon={<Rows3 className="h-3.5 w-3.5" />}
            label="行距"
            value={props.lineHeightVal}
            min={MIN_LINE_HEIGHT}
            max={MAX_LINE_HEIGHT}
            step={0.1}
            suffix="×"
            onChange={props.setLineHeightVal}
            onCommit={(v) => props.onApplyValueTag('lh', v)}
            tooltip="行间距滑块：松手后应用到选中文本"
          />
        </div>

        <TooltipProvider>
          <Tooltip>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    插入
                  </button>
                </TooltipTrigger>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="start" className="w-52">
                {INSERT_BLOCKS.map((b) => {
                  const Icon = b.icon;
                  return (
                    <DropdownMenuItem
                      key={b.id}
                      className="flex cursor-pointer items-center gap-2 text-xs"
                      onClick={() => props.insertTag(b.snippet)}
                    >
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="flex-1">{b.label}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
            <TooltipContent>
              <p>插入块级内容：表格 / 纯文本 / 引用 / 任务列表 / 多栏 / 高亮块</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <ListOrdered className="h-3.5 w-3.5" />
                    列表
                  </button>
                </TooltipTrigger>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="end" className="w-44">
                {LIST_STYLES.map((style) => (
                  <DropdownMenuItem
                    key={style.id}
                    className="flex cursor-pointer items-center justify-between gap-2 text-xs"
                    onClick={() => props.onApplyListStyle(style.id)}
                  >
                    <span>{style.label}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {style.sample}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <TooltipContent>
              <p>将所选行转换为指定序号格式</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <ToolbarDivider />

        <div className="flex flex-wrap items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <Popover>
                <PopoverTrigger asChild>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <Type className="h-3.5 w-3.5" />
                      字体
                    </button>
                  </TooltipTrigger>
                </PopoverTrigger>
                <PopoverContent side="bottom" align="end">
                  <FontPanel onApplyFont={props.onApplyFont} onApplyWeight={props.onApplyWeight} />
                </PopoverContent>
              </Popover>
              <TooltipContent>
                <p>字体族与粗细设置</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <AlignLeft className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="end" className="w-36">
                  {ALIGN_OPTIONS.map((a) => {
                    const Icon = a.icon;
                    return (
                      <DropdownMenuItem
                        key={a.id}
                        className="flex cursor-pointer items-center gap-2 text-xs"
                        onClick={() => props.onApplyAlignment(a.id)}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {a.label}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
              <TooltipContent>
                <p>设置所选行的对齐方式</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <ToolbarButton
          icon={<LayoutTemplate className="h-3.5 w-3.5" />}
          label="模版"
          tooltip="预设模版库"
          onClick={props.onOpenTemplates}
        />

        <ToolbarDivider />

        <ToolbarButton
          icon={<Search className="h-3.5 w-3.5" />}
          label="查找"
          tooltip="查找与替换"
          active={props.searchOpen}
          onClick={props.onToggleSearch}
        />
      </div>
    </div>
  );
};

interface ValuePopoverProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (v: number) => void;
  onCommit: (v: number) => void;
  tooltip: string;
}

const ValuePopover: React.FC<ValuePopoverProps> = ({
  icon,
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
  onCommit,
  tooltip,
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <Popover>
          <PopoverTrigger asChild>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {icon}
                {label}
              </button>
            </TooltipTrigger>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="end" className="w-64 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{label}</span>
              <span className="font-mono text-xs font-semibold text-foreground">
                {step < 1 ? value.toFixed(1) : value}
                {suffix}
              </span>
            </div>
            <Slider
              value={[value]}
              min={min}
              max={max}
              step={step}
              onValueChange={(v) => onChange(v[0])}
              onValueCommit={(v) => onCommit(v[0])}
              className="mt-4"
            />
            <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground">
              <span>
                {min}
                {suffix}
              </span>
              <span>
                {max}
                {suffix}
              </span>
            </div>
          </PopoverContent>
        </Popover>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
