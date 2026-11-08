import React, { useState } from 'react';
import {
  BookmarkPlus,
  FoldHorizontal,
  Maximize2,
  Minus,
  Monitor,
  Plus,
  Proportions,
  RectangleHorizontal,
  Smartphone,
  Tablet,
  User,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  type DevicePreset,
  type PresetCategory,
  CATEGORY_ORDER,
  CATEGORY_LABELS,
} from '@/lib/presets';

const CATEGORY_ICONS: Record<PresetCategory, React.ElementType> = {
  phone: Smartphone,
  foldable: FoldHorizontal,
  ultrawide: RectangleHorizontal,
  tablet: Tablet,
  desktop: Monitor,
  aspect: Proportions,
};

interface DimensionControlsProps {
  width: number;
  height: number;
  presets: DevicePreset[];
  activePresetId: string | null;
  onWidthChange: (value: number) => void;
  onHeightChange: (value: number) => void;
  onSelectPreset: (preset: DevicePreset) => void;
  onSavePreset: (name: string) => void;
  autoFit: boolean;
  scale: number;
  onToggleAutoFit: () => void;
  onManualZoom: (pct: number) => void;
}

const clampInt = (raw: string): number | null => {
  if (raw.trim() === '') return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0 || !Number.isInteger(n)) return null;
  return n;
};

const DimensionControls: React.FC<DimensionControlsProps> = ({
  width,
  height,
  presets,
  activePresetId,
  onWidthChange,
  onHeightChange,
  onSelectPreset,
  onSavePreset,
  autoFit,
  scale,
  onToggleAutoFit,
  onManualZoom,
}) => {
  const [saveOpen, setSaveOpen] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const customs = presets.filter((p) => p.custom);
  const zoomPct = Math.round(scale * 100);
  const stepZoom = (delta: number) => {
    const next = Math.round(zoomPct / 5) * 5 + delta;
    onManualZoom(Math.min(400, Math.max(10, next)));
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('请输入预设名称');
      return;
    }
    if (presets.some((p) => p.name === trimmed)) {
      setError('该名称已存在，请修改后重试');
      return;
    }
    onSavePreset(trimmed);
    setName('');
    setError('');
    setSaveOpen(false);
    toast.success(`已保存预设「${trimmed}」`);
  };

  return (
    <div className="flex flex-col gap-2 border-b border-border px-3 py-3 md:px-5">
      {/* 第一行：宽高输入 + 缩放控制（窄屏自动换行，缩放百分比完整可见） */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex items-center gap-2">
          <Label className="shrink-0 text-xs font-medium text-muted-foreground">宽度</Label>
          <div className="relative">
            <Input
              type="number"
              min={1}
              value={width}
              onChange={(e) => {
                const v = clampInt(e.target.value);
                if (v !== null) onWidthChange(v);
              }}
              className="h-8 w-20 pr-8 font-mono text-sm md:w-24"
            />
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              px
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Label className="shrink-0 text-xs font-medium text-muted-foreground">高度</Label>
          <div className="relative">
            <Input
              type="number"
              min={1}
              value={height}
              onChange={(e) => {
                const v = clampInt(e.target.value);
                if (v !== null) onHeightChange(v);
              }}
              className="h-8 w-20 pr-8 font-mono text-sm md:w-24"
            />
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              px
            </span>
          </div>
        </div>

        <div className="hidden h-6 w-px shrink-0 bg-border md:block" />

        {/* 缩放控制区（右对齐，窄屏换行后仍完整展示） */}
        <div className="ml-auto flex shrink-0 items-center gap-1">
          {autoFit ? (
            // 自适应模式：单个按钮，显示当前缩放比，点击切换为手动
            <Button
              variant="secondary"
              size="sm"
              className="h-8 gap-1.5 px-3"
              onClick={onToggleAutoFit}
              title="当前为自动适应模式，点击切换为手动缩放"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span className="font-mono text-xs">自适应 · {zoomPct}%</span>
            </Button>
          ) : (
            // 手动模式：回自适应按钮 + 减 + 百分比 + 加
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onToggleAutoFit}
                title="切换回自动适应模式"
              >
                <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => stepZoom(-5)}
                disabled={zoomPct <= 10}
                title="缩小 5%"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
              <span className="w-12 text-center font-mono text-xs text-foreground tabular-nums">
                {zoomPct}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => stepZoom(5)}
                disabled={zoomPct >= 400}
                title="放大 5%"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 第二行：设备预设 + 保存预设 */}
      <div className="flex flex-wrap items-center gap-3">
      <Select
        value={activePresetId ?? 'none'}
        onValueChange={(val) => {
          if (val === 'none') return;
          const preset = presets.find((p) => p.id === val);
          if (preset) onSelectPreset(preset);
        }}
      >
        <SelectTrigger className="h-8 w-44 text-sm">
          <SelectValue placeholder="选择设备预设" />
        </SelectTrigger>
        <SelectContent>
          {CATEGORY_ORDER.map((cat) => {
            const items = presets.filter((p) => p.category === cat && !p.custom);
            if (items.length === 0) return null;
            const Icon = CATEGORY_ICONS[cat];
            return (
              <SelectGroup key={cat}>
                <SelectLabel className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5" />
                  {CATEGORY_LABELS[cat]}
                </SelectLabel>
                {items.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="font-mono text-xs">
                    {p.name} · {p.width}×{p.height}
                    {p.ratio ? ` · ${p.ratio}` : ''}
                  </SelectItem>
                ))}
              </SelectGroup>
            );
          })}
          {customs.length > 0 && (
            <SelectGroup>
              <SelectLabel className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {CATEGORY_LABELS.custom}
              </SelectLabel>
              {customs.map((p) => (
                <SelectItem key={p.id} value={p.id} className="font-mono text-xs">
                  {p.name} · {p.width}×{p.height}
                </SelectItem>
              ))}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>

      <Button variant="secondary" size="sm" className="h-8 gap-1.5" onClick={() => setSaveOpen(true)}>
        <BookmarkPlus className="h-4 w-4" />
        保存预设
      </Button>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <DialogHeader>
            <DialogTitle>保存为自定义预设</DialogTitle>
            <DialogDescription>
              将当前尺寸 {width}×{height}px 保存为自定义预设，便于后续一键切换。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="preset-name">预设名称</Label>
            <Input
              id="preset-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="例如：我的博客封面"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
              }}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

export default DimensionControls;