import React, { useState } from 'react';
import { Monitor, X } from 'lucide-react';

const MobileGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showBanner, setShowBanner] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent || '';
    const uaMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua);
    return uaMobile && window.innerWidth < 640;
  });

  return (
    <>
      {showBanner && (
        <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/90 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur md:hidden">
          <div className="flex items-center gap-1.5 truncate">
            <Monitor className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate">当前为移动/窄屏视图，建议在 PC 端体验完整双栏</span>
          </div>
          <button
            type="button"
            onClick={() => setShowBanner(false)}
            className="shrink-0 rounded p-1 hover:bg-background/50"
            title="关闭提示"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      {children}
    </>
  );
};

export default MobileGate;
