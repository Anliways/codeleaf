import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

/** 顶栏主题切换按钮：明（灰）/ 暗（黑）两套配色间切换，跟随系统为初始值 */
const ThemeToggle: React.FC = () => {
  const { resolvedTheme, setTheme } = useTheme();
  // 挂载前渲染占位符，避免服务端/首帧图标不一致造成偏移
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <span className="inline-block h-8 w-8" aria-hidden="true" />;
  }

  const isDark = resolvedTheme === 'dark';
  return (
    <button
      type="button"
      aria-label="切换主题"
      title={isDark ? '切换为浅色主题' : '切换为深色主题'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
};

export default ThemeToggle;
