import React from 'react';
import { Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { composeHex8, CHECKERBOARD_BG } from '@/lib/color';
import type { Align } from '@/lib/render';

/**
 * 分割线配置浮层
 * 模式切换 / 文字 / 对齐 / 自定义颜色，并实时预览生成语法
 */
interface HrPopoverProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: 'line' | 'text';
  setMode: (v: 'line' | 'text') => void;
  text: string;
  setText: (v: string) => void;
  align: Exclude<Align, 'justify'>;
  setAlign: (v: Exclude<Align, 'justify'>) => void;
  customLine: boolean;
  setCustomLine: (v: boolean) => void;
  customText: boolean;
  setCustomText: (v: boolean) => void;
  lineColor: string;
  setLineColor: (v: string) => void;
  textColor: string;
  setTextColor: (v: string) => void;
  syntax: string;
  onInsert: () => void;
}

const HEX6_RE = /^#[0-9A-Fa-f]{6}$/;
const ALIGN_OPTIONS = [
  { id: 'left' as const, label: '左对齐' },
  { id: 'center' as const, label: '居中' },
  { id: 'right' as const, label: '右对齐' },
];

export const HrPopover: React.FC<HrPopoverProps> = ({
  open,
  onOpenChange,
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
  onInsert,
}) => {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="分割线">
          <Minus className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="w-72 space-y-3 p-3">
        <div className="grid grid-cols-2 gap-1 rounded-md bg-muted p-0.5">
          <Button
            variant={mode === 'line' ? 'default' : 'ghost'}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setMode('line')}
          >
            纯线段
          </Button>
          <Button
            variant={mode === 'text' ? 'default' : 'ghost'}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setMode('text')}
          >
            带文字
          </Button>
        </div>

        {mode === 'text' && (
          <>
            <div className="space-y-1">
              <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                文字内容
              </label>
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="分割线"
                className="h-7 text-xs"
                maxLength={20}
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                文字对齐
              </span>
              <div className="grid grid-cols-3 gap-1">
                {ALIGN_OPTIONS.map((a) => (
                  <Button
                    key={a.id}
                    variant={align === a.id ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setAlign(a.id)}
                  >
                    {a.label}
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}

        <ColorControl
          label="自定义线条颜色"
          checked={customLine}
          onCheck={setCustomLine}
          color={lineColor}
          onColor={setLineColor}
          placeholder="#E4E4E7"
        />

        {mode === 'text' && (
          <ColorControl
            label="自定义文字颜色"
            checked={customText}
            onCheck={setCustomText}
            color={textColor}
            onColor={setTextColor}
            placeholder="#71717A"
          />
        )}

        <div className="rounded-md border border-border bg-background px-3 py-2.5">
          <div className="flex items-center gap-2">
            {mode === 'text' && align !== 'left' && (
              <div
                className="h-px flex-1"
                style={{ backgroundColor: customLine ? lineColor : 'var(--border)' }}
              />
            )}
            {mode === 'text' && (
              <span
                style={{ color: customText ? textColor : 'var(--muted-foreground)' }}
                className="whitespace-nowrap text-[11px] font-medium tracking-wide"
              >
                {text.trim() || '分割线'}
              </span>
            )}
            {mode === 'text' && align !== 'right' && (
              <div
                className="h-px flex-1"
                style={{ backgroundColor: customLine ? lineColor : 'var(--border)' }}
              />
            )}
            {mode === 'line' && (
              <div
                className="h-px w-full"
                style={{ backgroundColor: customLine ? lineColor : 'var(--border)' }}
              />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <code className="min-w-0 flex-1 truncate rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            {syntax}
          </code>
          <Button size="sm" className="h-7 shrink-0 text-xs" onClick={onInsert}>
            插入
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const ColorControl: React.FC<{
  label: string;
  checked: boolean;
  onCheck: (v: boolean) => void;
  color: string;
  onColor: (v: string) => void;
  placeholder: string;
}> = ({ label, checked, onCheck, color, onColor, placeholder }) => {
  const valid = HEX6_RE.test(color);
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheck(e.target.checked)}
          className="h-3.5 w-3.5"
        />
        {label}
      </label>
      {checked && (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={valid ? color : placeholder}
            onChange={(e) => onColor(e.target.value.toUpperCase())}
            className="h-7 w-8 shrink-0 cursor-pointer rounded border border-border bg-background p-0.5"
            title="调色盘取色"
          />
          <Input
            value={color}
            onChange={(e) => onColor(e.target.value.toUpperCase())}
            placeholder={placeholder}
            className="h-7 flex-1 font-mono text-xs"
            maxLength={7}
          />
        </div>
      )}
    </div>
  );
};
