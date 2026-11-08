import React from 'react';
import { Check, Copy } from 'lucide-react';

/**
 * 代码块复制按钮
 * 支持 clipboard API 降级到 execCommand，带成功反馈计时器
 */
interface CodeCopyButtonProps {
  code: string;
}

export const CodeCopyButton: React.FC<CodeCopyButtonProps> = ({ code }) => {
  const [copied, setCopied] = React.useState(false);
  const timerRef = React.useRef<number | undefined>(undefined);

  React.useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = code;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      data-export-exclude="true"
      onClick={handleCopy}
      className="absolute right-2 top-2 flex items-center gap-1 rounded-md border border-border bg-background/95 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground opacity-100 shadow-sm transition-opacity hover:bg-accent hover:text-foreground focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-primary" />
          已复制
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          复制
        </>
      )}
    </button>
  );
};
