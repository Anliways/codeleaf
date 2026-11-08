import React from 'react';
import { Search, ChevronUp, ChevronDown, Replace, ReplaceAll, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * 查找与替换面板
 */
interface SearchPanelProps {
  searchTerm: string;
  onSearchTermChange: (v: string) => void;
  replaceTerm: string;
  onReplaceTermChange: (v: string) => void;
  matchCount: number;
  currentMatchNo: number;
  onJump: (dir: 1 | -1) => void;
  onReplace: () => void;
  onReplaceAll: () => void;
  onClose: () => void;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  searchTerm,
  onSearchTermChange,
  replaceTerm,
  onReplaceTermChange,
  matchCount,
  currentMatchNo,
  onJump,
  onReplace,
  onReplaceAll,
  onClose,
}) => {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-muted/40 px-3 py-2 md:px-5">
      <div className="relative shrink-0">
        <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          placeholder="查找关键词"
          className="h-7 w-36 pl-7 pr-11 text-xs md:w-44"
        />
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] tabular-nums text-muted-foreground">
          {searchTerm ? `${currentMatchNo}/${matchCount}` : ''}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          disabled={matchCount === 0}
          onClick={() => onJump(-1)}
          title="上一个匹配"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          disabled={matchCount === 0}
          onClick={() => onJump(1)}
          title="下一个匹配"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </div>
      <Input
        value={replaceTerm}
        onChange={(e) => onReplaceTermChange(e.target.value)}
        placeholder="替换为（留空即删除）"
        className="h-7 w-36 px-2 text-xs md:w-44"
      />
      <Button
        variant="secondary"
        size="sm"
        className="h-7 gap-1 px-2.5 text-xs"
        disabled={matchCount === 0}
        onClick={onReplace}
      >
        <Replace className="h-3 w-3" />
        替换
      </Button>
      <Button
        variant="secondary"
        size="sm"
        className="h-7 gap-1 px-2.5 text-xs"
        disabled={matchCount === 0}
        onClick={onReplaceAll}
      >
        <ReplaceAll className="h-3 w-3" />
        全部替换
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="ml-auto h-7 w-7"
        onClick={onClose}
        title="关闭查找与替换"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};
