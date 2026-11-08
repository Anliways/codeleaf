import React from 'react';
import { Columns2, PenLine, Eye } from 'lucide-react';

/**
 * 顶栏视图切换器
 * 桌面端显示分栏入口，移动端仅显示编辑/预览单视图
 */
type ViewMode = 'split' | 'editor' | 'preview';

interface ViewSwitcherProps {
  mode: ViewMode;
  onSwitch: (mode: ViewMode, anim: 'fade' | 'from-left' | 'from-right') => void;
}

const btnBase =
  'flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors';

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ mode, onSwitch }) => {
  const activeCls = 'bg-background text-foreground shadow-sm';
  const inactiveCls = 'text-muted-foreground hover:text-foreground';

  return (
    <div className="flex items-center rounded-lg border border-border bg-muted/60 p-0.5">
      <button
        type="button"
        onClick={() => onSwitch('split', 'fade')}
        className={`${btnBase} hidden items-center md:flex ${mode === 'split' ? activeCls : inactiveCls}`}
        title="双栏视图"
      >
        <Columns2 className="h-3.5 w-3.5" />
        <span className="hidden md:inline">分栏</span>
      </button>
      <button
        type="button"
        onClick={() => onSwitch('editor', 'from-left')}
        className={`${btnBase} ${mode === 'editor' ? activeCls : inactiveCls}`}
        title="仅编辑区（预览视图下右滑也可返回）"
      >
        <PenLine className="h-3.5 w-3.5" />
        <span className="hidden md:inline">编辑</span>
      </button>
      <button
        type="button"
        onClick={() => onSwitch('preview', 'from-right')}
        className={`${btnBase} ${mode === 'preview' ? activeCls : inactiveCls}`}
        title="仅预览区（编辑视图下左滑也可切换）"
      >
        <Eye className="h-3.5 w-3.5" />
        <span className="hidden md:inline">预览</span>
      </button>
    </div>
  );
};
