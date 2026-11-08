import React from 'react';
import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { PRESET_COLORS } from '@/lib/editor/constants';
import { composeHex8, CHECKERBOARD_BG } from '@/lib/color';

/**
 * 颜色选择器下拉
 * 包含预设色板与自定义颜色（HEX + 调色盘 + Alpha）
 */
interface ColorPickerProps {
  hex: string;
  alpha: number;
  onHexChange: (v: string) => void;
  onAlphaChange: (v: number) => void;
  onApply: (value: string) => void;
}

const HEX6_RE = /^#[0-9A-Fa-f]{6}$/;

export const ColorPicker: React.FC<ColorPickerProps> = ({
  hex,
  alpha,
  onHexChange,
  onAlphaChange,
  onApply,
}) => {
  const validHex = HEX6_RE.test(hex);
  const previewColor = validHex ? composeHex8(hex, alpha) : 'transparent';

  return (
    <TooltipProvider>
      <Tooltip>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-xs">
                <Palette className="h-3.5 w-3.5" />
                颜色
              </Button>
            </TooltipTrigger>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="end" className="w-56">
            <div className="grid grid-cols-6 gap-1 p-2">
              {PRESET_COLORS.map((color) => (
                <DropdownMenuItem
                  key={color.value}
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full p-0"
                  onClick={() => onApply(color.value)}
                  title={color.label}
                >
                  <span
                    className={`h-5 w-5 rounded-full border border-border ${color.className}`}
                  />
                </DropdownMenuItem>
              ))}
            </div>
            <div
              className="space-y-1.5 border-t border-border p-2"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                自定义颜色
              </p>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={validHex ? hex : '#3B82F6'}
                  onChange={(e) => onHexChange(e.target.value.toUpperCase())}
                  className="h-7 w-8 shrink-0 cursor-pointer rounded border border-border bg-background p-0.5"
                  title="调色盘取色"
                />
                <Input
                  value={hex}
                  onChange={(e) => onHexChange(e.target.value.toUpperCase())}
                  placeholder="#RRGGBB"
                  className="h-7 w-24 shrink-0 px-2 font-mono text-xs"
                  maxLength={7}
                />
                <span
                  className="ml-auto flex h-7 w-7 items-center justify-center rounded-full"
                  style={{
                    backgroundImage: CHECKERBOARD_BG,
                    backgroundSize: '8px 8px',
                    backgroundPosition: '0 0, 4px 4px',
                  }}
                  title="颜色预览"
                >
                  <span
                    className="h-5 w-5 rounded-full border border-border"
                    style={{ backgroundColor: previewColor }}
                  />
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Slider
                  value={[alpha]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={(v) => onAlphaChange(v[0])}
                  className="flex-1"
                />
                <span className="w-10 shrink-0 text-right font-mono text-xs font-semibold text-foreground">
                  {alpha}%
                </span>
              </div>
              <Button
                size="sm"
                className="h-7 w-full text-xs"
                disabled={!validHex}
                title="插入颜色标签（hex8 含透明度）"
                onClick={() => onApply(composeHex8(hex, alpha))}
              >
                应用颜色
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <TooltipContent>
          <p>插入颜色标签</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
