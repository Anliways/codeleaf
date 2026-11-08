import React from 'react';
import { PenLine, LayoutTemplate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toolbar } from '@/components/editor/toolbar';
import { SearchPanel } from '@/components/editor/SearchPanel';
import { useLineNumbers } from '@/hooks/useEditorHelpers';
import { useTextareaAutosize } from '@/hooks/useTextareaAutosize';
import type { AlignId, ListStyleId } from '@/lib/editor/constants';
import type { Align } from '@/lib/render';

/**
 * 编辑区组件
 * 组合工具栏、查找替换面板、行号与自适应 textarea
 */
interface EditorSectionProps {
  text: string;
  onChange: (v: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  insertTag: (snippet: string) => void;
  onToggleItalic: () => void;
  onApplyHeading: (level: number) => void;
  onApplyListStyle: (id: ListStyleId) => void;
  onApplyAlignment: (id: AlignId) => void;
  onClearFormat: () => void;
  onApplyFontSize: (size: number) => void;
  onApplyValueTag: (tag: string, value: number) => void;
  onApplyFont: (family: string) => void;
  onApplyWeight: (weight: number) => void;
  onInsertHr: () => void;
  onOpenTemplates: () => void;
  onImageClick: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  search: {
    open: boolean;
    term: string;
    setTerm: (v: string) => void;
    replaceWith: string;
    setReplaceWith: (v: string) => void;
    count: number;
    currentNo: number;
    jump: (dir: 1 | -1) => void;
    replaceCurrent: () => void;
    replaceAll: () => void;
    close: () => void;
  };
  uploadingImage: boolean;
  fontSize: number;
  setFontSize: (v: number) => void;
  letterSpacing: number;
  setLetterSpacing: (v: number) => void;
  lineHeightVal: number;
  setLineHeightVal: (v: number) => void;
  customHex: string;
  customAlpha: number;
  setCustomHex: (v: string) => void;
  setCustomAlpha: (v: number) => void;
  hr: {
    open: boolean;
    setOpen: (v: boolean) => void;
    mode: 'line' | 'text';
    setMode: (v: 'line' | 'text') => void;
    text: string;
    setText: (v: string) => void;
    align: Exclude<Align, 'justify'>;
    setAlign: (v: Exclude<Align, 'justify'>) => void;
    customLine: boolean;
    setCustomLine: (v: boolean) => void;
    customText: boolean;
    setCustomText: (v: boolean) => void;
    lineColor: string;
    setLineColor: (v: string) => void;
    textColor: string;
    setTextColor: (v: string) => void;
    syntax: string;
  };
  onTouchStart: React.TouchEventHandler<HTMLElement>;
  onTouchEnd: React.TouchEventHandler<HTMLDivElement>;
}

export const EditorSection: React.FC<EditorSectionProps> = (props) => {
  const { lineNumbers } = useLineNumbers(props.text);
  useTextareaAutosize(props.textareaRef, props.scrollRef, props.text);

  return (
    <section
      id="editor"
      className="flex h-full min-h-0 min-w-0 flex-1 flex-col bg-background"
    >
      <Toolbar
        canUndo={props.canUndo}
        canRedo={props.canRedo}
        onUndo={props.onUndo}
        onRedo={props.onRedo}
        insertTag={props.insertTag}
        onToggleItalic={props.onToggleItalic}
        onApplyHeading={props.onApplyHeading}
        onApplyListStyle={props.onApplyListStyle}
        onApplyAlignment={props.onApplyAlignment}
        onClearFormat={props.onClearFormat}
        onApplyFontSize={props.onApplyFontSize}
        onApplyValueTag={props.onApplyValueTag}
        onApplyFont={props.onApplyFont}
        onApplyWeight={props.onApplyWeight}
        onInsertHr={props.onInsertHr}
        onOpenTemplates={props.onOpenTemplates}
        searchOpen={props.search.open}
        onToggleSearch={() =>
          props.search.open ? props.search.close() : props.search.openSearch()
        }
        onImageClick={props.onImageClick}
        uploadingImage={props.uploadingImage}
        fontSize={props.fontSize}
        setFontSize={props.setFontSize}
        letterSpacing={props.letterSpacing}
        setLetterSpacing={props.setLetterSpacing}
        lineHeightVal={props.lineHeightVal}
        setLineHeightVal={props.setLineHeightVal}
        customHex={props.customHex}
        customAlpha={props.customAlpha}
        setCustomHex={props.setCustomHex}
        setCustomAlpha={props.setCustomAlpha}
        hr={props.hr}
      />

      {props.search.open && (
        <SearchPanel
          searchTerm={props.search.term}
          onSearchTermChange={(v) => props.search.setTerm(v)}
          replaceTerm={props.search.replaceWith}
          onReplaceTermChange={props.search.setReplaceWith}
          matchCount={props.search.count}
          currentMatchNo={props.search.currentNo}
          onJump={props.search.jump}
          onReplace={props.search.replaceCurrent}
          onReplaceAll={props.search.replaceAll}
          onClose={props.search.close}
        />
      )}

      <div
        ref={props.scrollRef}
        onTouchStart={props.onTouchStart}
        onTouchEnd={props.onTouchEnd}
        className="relative min-h-0 flex-1 overflow-y-auto"
      >
        <div className="flex min-h-full text-sm leading-6">
          <div className="select-none border-r border-border px-3 py-4 text-right font-mono text-muted-foreground/50">
            {lineNumbers.map((n) => (
              <div key={n}>{n}</div>
            ))}
          </div>
          <textarea
            ref={props.textareaRef}
            value={props.text}
            onChange={(e) => props.onChange(e.target.value)}
            onKeyDown={props.onKeyDown}
            spellCheck={false}
            className="min-h-full flex-1 resize-none overflow-hidden bg-transparent px-4 py-4 leading-6 text-foreground outline-none"
          />
        </div>

        {props.text === '' && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-6">
            <div className="flex max-w-xs flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
                <PenLine className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">从这里开始创作</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                直接键入文本，支持 Markdown 快捷语法与排版标签（如 # 标题、**加粗**、``` 代码块），预览区实时呈现排版效果。
              </p>
              <Button
                size="sm"
                className="pointer-events-auto h-7 gap-1.5 text-xs"
                onClick={props.onOpenTemplates}
              >
                <LayoutTemplate className="h-3.5 w-3.5" />
                从模版库快速开始
              </Button>
              <p className="text-[11px] leading-relaxed text-muted-foreground/70">
                小提示：顶部工具栏可一键插入排版标签，「查找」支持全文检索与批量替换。
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
