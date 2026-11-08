import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * 工具栏图标按钮封装
 * 统一处理 Tooltip、尺寸与禁用状态，减少重复 JSX
 */
interface ToolbarButtonProps {
  icon: React.ReactNode;
  label?: string;
  tooltip: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
  title?: string;
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon,
  label,
  tooltip,
  active = false,
  disabled = false,
  onClick,
  className = '',
  title,
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            title={title}
            disabled={disabled}
            onClick={onClick}
            className={`${label ? 'h-7 gap-1.5 px-2 text-xs' : 'h-7 w-7 p-0'} ${active ? 'bg-secondary text-foreground' : ''} ${className}`}
          >
            {icon}
            {label ? <span className="hidden md:inline">{label}</span> : null}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const ToolbarDivider: React.FC = () => (
  <div className="mx-1 h-4 w-px shrink-0 bg-border" />
);
