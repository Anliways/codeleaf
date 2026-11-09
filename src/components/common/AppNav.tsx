import { Link, useLocation } from 'react-router-dom';

const ITEMS = [
  { to: '/', label: '文本预览' },
  { to: '/media', label: '自媒体' },
];

/** 顶栏页面导航（胶囊式，与 ViewSwitcher 风格一致） */
export const AppNav = () => {
  const { pathname } = useLocation();
  return (
    <nav className="flex shrink-0 items-center gap-0.5 rounded-full bg-muted p-0.5">
      {ITEMS.map((it) => {
        const active = pathname === it.to;
        return (
          <Link
            key={it.to}
            to={it.to}
            className={
              'whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium transition-colors md:px-3 md:text-sm ' +
              (active
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground')
            }
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
};
