import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FontPanelProps {
  onApplyFont: (family: string) => void;
  onApplyWeight: (weight: number) => void;
}

const FONT_FAMILIES = [
  { label: '默认无衬线', value: 'system-ui, sans-serif' },
  { label: '衬线体', value: 'Georgia, "Times New Roman", serif' },
  { label: '等宽体', value: '"JetBrains Mono", ui-monospace, monospace' },
  { label: '楷体', value: '"Kaiti SC", "STKaiti", "KaiTi", serif' },
  { label: '黑体', value: '"PingFang SC", "Microsoft YaHei", sans-serif' },
  { label: '宋体', value: '"SimSun", "Songti SC", serif' },
];

const FONT_WEIGHTS = [
  { label: '常规 400', value: '400' },
  { label: '中等 500', value: '500' },
  { label: '半粗 600', value: '600' },
  { label: '粗体 700', value: '700' },
];

const FontPanel: React.FC<FontPanelProps> = ({ onApplyFont, onApplyWeight }) => {
  const [family, setFamily] = useState(FONT_FAMILIES[0].value);
  const [weight, setWeight] = useState('400');

  return (
    <div className="w-64 space-y-3 p-1">
      <div className="space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">字体族</span>
        <Select
          value={family}
          onValueChange={(v) => {
            setFamily(v);
            onApplyFont(v);
          }}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((f) => (
              <SelectItem key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">字体粗细</span>
        <Select
          value={weight}
          onValueChange={(v) => {
            setWeight(v);
            onApplyWeight(Number(v));
          }}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_WEIGHTS.map((w) => (
              <SelectItem key={w.value} value={w.value} style={{ fontWeight: Number(w.value) }}>
                {w.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <p className="text-[10px] leading-relaxed text-muted-foreground">
        选择后自动应用到选中文本
      </p>
    </div>
  );
};

export default FontPanel;