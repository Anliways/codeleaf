import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { GripVertical } from 'lucide-react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { EditorSection } from '@/components/editor/EditorSection';
import { PreviewSection } from '@/components/preview/PreviewSection';
import { ViewSwitcher } from '@/components/common/ViewSwitcher';
import TemplateDialog from '@/components/editor/TemplateDialog';
import { useHistory } from '@/hooks/useHistory';
import { useContainerScale } from '@/hooks/useContainerScale';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSearchReplace } from '@/hooks/useSearchReplace';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useExportPng } from '@/hooks/useExportPng';
import { useHorizontalRule } from '@/hooks/useHorizontalRule';
import { useSavedViewState } from '@/hooks/useEditorHelpers';
import { BUILT_IN_PRESETS, type DevicePreset } from '@/lib/presets';
import { DEFAULT_TEXT } from '@/lib/editor/defaultText';
import {
  stripFormatTags,
  LIST_STYLES,
  type ListStyleId,
  type AlignId,
} from '@/lib/editor/constants';
import { getSelection, focusCursor, transformSelectedLines } from '@/lib/editor/selection';
import type { TextTemplate } from '@/lib/templates';

type ViewMode = 'split' | 'editor' | 'preview';

/**
 * 实时文本预览器主页面
 *  responsibilities:
 *  - 统一管理编辑文本、画布尺寸、视图模式等核心状态
 *  - 提供文本格式化、列表、标题、对齐、图片上传、查找替换等操作回调
 *  - 通过拆分出的 EditorSection / PreviewSection / Toolbar 降低单文件复杂度
 */
const TextPreviewer: React.FC = () => {
  // ---- 文本历史 ----
  const { state: text, set: setText, undo, redo, canUndo, canRedo } =
    useHistory(DEFAULT_TEXT);

  // ---- 画布尺寸与预设 ----
  const [width, setWidth] = useState(375);
  const [height, setHeight] = useState(667);
  const [customPresets, setCustomPresets] = useState<DevicePreset[]>([]);
  const [activePresetId, setActivePresetId] = useState<string | null>('desktop-xga');
  const [autoFit, setAutoFit] = useState(true);
  const [manualZoomPct, setManualZoomPct] = useState(100);
  const presets = useMemo(() => [...BUILT_IN_PRESETS, ...customPresets], [customPresets]);

  // ---- 缩放 ----
  const { containerRef, autoScale } = useContainerScale(width, height, autoFit);
  const scale = autoFit ? autoScale : manualZoomPct / 100;

  // ---- 视图模式 ----
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return 'editor';
    return 'split';
  });
  const [viewAnim, setViewAnim] = useState<'fade' | 'from-left' | 'from-right'>('fade');
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile && viewMode === 'split') setViewMode('editor');
  }, [isMobile, viewMode]);

  // ---- 格式化滑块状态 ----
  const [fontSize, setFontSize] = useState(16);
  const [letterSpacing, setLetterSpacing] = useState(1);
  const [lineHeightVal, setLineHeightVal] = useState(1.5);

  // ---- 自定义颜色 ----
  const [customHex, setCustomHex] = useState('#3B82F6');
  const [customAlpha, setCustomAlpha] = useState(100);

  // ---- 分割线 ----
  const hr = useHorizontalRule();

  // ---- 表格紧凑 ----
  const [tableCompact, setTableCompact] = useState(false);

  // ---- 模板与确认 ----
  const [templateOpen, setTemplateOpen] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<TextTemplate | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // ---- Refs ----
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorScrollRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  // ---- 导出 / 上传 / 查找替换 ----
  const { exportRef, exporting, exportPng } = useExportPng();
  const { inputRef: imageInputRef, uploading: uploadingImage, handleChange: handleImageUpload } =
    useImageUpload({
      onInsert: (snippet, cursorOffset) => insertAtCursor(snippet, cursorOffset),
    });
  const search = useSearchReplace(text, setText, textareaRef, editorScrollRef);

  // ---- 视图状态保存与恢复 ----
  const { saveEditor, savePreview, restoreEditor, restorePreview } = useSavedViewState();

  const switchView = useCallback(
    (next: ViewMode, anim: 'fade' | 'from-left' | 'from-right' = 'fade') => {
      if (next === viewMode) return;
      if (viewMode === 'editor') {
        saveEditor(editorScrollRef.current, textareaRef.current);
      } else if (viewMode === 'preview') {
        savePreview(containerRef.current);
      }
      hr.setOpen(false);
      if (search.open) search.close();
      setViewAnim(anim);
      setViewMode(next);
    },
    [viewMode, hr, search, containerRef],
  );

  useEffect(() => {
    if (viewMode === 'editor') {
      restoreEditor(editorScrollRef.current, textareaRef.current);
    } else if (viewMode === 'preview') {
      restorePreview(containerRef.current);
    }
  }, [viewMode, restoreEditor, restorePreview]);

  // ---- 文本格式化工具函数 ----
  const insertAtCursor = useCallback(
    (snippet: string, cursorOffset: number = snippet.length) => {
      const el = textareaRef.current;
      if (!el) {
        setText((prev) => prev + snippet);
        return;
      }
      const { start, before, after } = getSelection(el, text);
      const insertion = before.endsWith('\n') || before === '' ? snippet : `\n${snippet}`;
      const newText = before + insertion + after;
      setText(newText);
      focusCursor(el, start + insertion.length - snippet.length + cursorOffset);
    },
    [setText, text],
  );

  const insertTag = useCallback(
    (snippet: string) => {
      const el = textareaRef.current;
      if (!el) {
        setText((prev) => prev + snippet);
        return;
      }
      const { start, before, selected, after } = getSelection(el, text);
      const insertion = selected ? snippet.replace('内容', selected) : snippet;
      const newText = before + insertion + after;
      setText(newText);
      focusCursor(el, start + insertion.length);
    },
    [setText, text],
  );

  const applyFontSize = useCallback(
    (size: number) => {
      const el = textareaRef.current;
      if (!el) {
        setText((prev) => prev + `<size=${size}>内容</size>`);
        return;
      }
      const { start, selected, before, after } = getSelection(el, text);
      const body = selected || '内容';
      const insertion = `<size=${size}>${body}</size>`;
      setText(before + insertion + after);
      focusCursor(el, start + insertion.length);
    },
    [setText, text],
  );

  const applyValueTag = useCallback(
    (tagName: string, value: number) => {
      insertTag(`<${tagName}=${value}>内容</${tagName}>`);
    },
    [insertTag],
  );

  const toggleItalicTag = useCallback(() => {
    const el = textareaRef.current;
    if (!el) {
      setText((prev) => prev + '<i>内容</i>');
      return;
    }
    const { start, end, before, selected, after } = getSelection(el, text);

    if (selected && before.endsWith('<i>') && after.startsWith('</i>')) {
      const newText = before.slice(0, -3) + selected + after.slice(4);
      setText(newText);
      focusCursor(el, start - 3, start - 3 + selected.length);
      return;
    }

    const innerMatch = selected.match(/^<i>([\s\S]*)<\/i>$/);
    if (innerMatch) {
      const inner = innerMatch[1];
      setText(before + inner + after);
      focusCursor(el, start, start + inner.length);
      return;
    }

    const insertion = `<i>${selected || '内容'}</i>`;
    setText(before + insertion + after);
    if (selected) {
      focusCursor(el, start + insertion.length);
    } else {
      focusCursor(el, start + 3, start + 5);
    }
  }, [setText, text]);

  const handleClearFormat = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const { start, end, before, selected, after } = getSelection(el, text);
    if (start === end) return;
    const cleaned = stripFormatTags(selected);
    const newText = before + cleaned + after;
    setText(newText);
    focusCursor(el, start, start + cleaned.length);
  }, [setText, text]);

  const applyListStyle = useCallback(
    (styleId: ListStyleId) => {
      const el = textareaRef.current;
      const style = LIST_STYLES.find((s) => s.id === styleId);
      if (!el || !style) return;
      const { start, end } = getSelection(el, text);
      const LIST_LINE_RE =
        /^(\d{1,3}[.)]|[ivxlcdm]{2,4}[.)]|[IVXLCDM]{2,4}[.)]|[a-z][.)]|[A-Z][.)]|[-*+●○☆★◆◇■□▲△▼▽※•†‡✦✧➤➢♪♥♦♣♠☐☑✓✔✗✘])\s+/;
      const { newText, rangeStart, rangeEnd } = transformSelectedLines(
        text,
        start,
        end,
        (line, idx) => {
          if (line.trim() === '') return line;
          const stripped = line.replace(LIST_LINE_RE, '');
          return `${style.marker(idx + 1)} ${stripped}`;
        },
      );
      setText(newText);
      focusCursor(el, rangeStart, rangeEnd);
    },
    [setText, text],
  );

  const applyHeading = useCallback(
    (level: number) => {
      const el = textareaRef.current;
      if (!el) return;
      const { start, end } = getSelection(el, text);
      const prefix = level > 0 ? `${'#'.repeat(level)} ` : '';
      const { newText, rangeStart, rangeEnd } = transformSelectedLines(
        text,
        start,
        end,
        (line) => {
          if (line.trim() === '') return line;
          const stripped = line.replace(/^#{1,6}\s+/, '');
          return prefix + stripped;
        },
      );
      setText(newText);
      focusCursor(el, rangeStart, rangeEnd);
    },
    [setText, text],
  );

  const applyAlignment = useCallback(
    (align: AlignId) => {
      const el = textareaRef.current;
      if (!el) return;
      const { start, end } = getSelection(el, text);
      const { newText, rangeStart, rangeEnd } = transformSelectedLines(
        text,
        start,
        end,
        (line) => {
          if (line.trim() === '') return line;
          const stripped = line.replace(/^:(left|center|right|justify)\s+/, '');
          return `:${align} ${stripped}`;
        },
      );
      setText(newText);
      focusCursor(el, rangeStart, rangeEnd);
    },
    [setText, text],
  );

  const applyFont = useCallback((family: string) => insertTag(`<font=${family}>内容</font>`), [insertTag]);
  const applyWeight = useCallback((weight: number) => insertTag(`<weight=${weight}>内容</weight>`), [insertTag]);

  const insertHorizontalRule = useCallback(() => {
    const el = textareaRef.current;
    if (!el) {
      setText((prev) => `${prev}\n${hr.syntax}\n`);
      return;
    }
    const { start, before, after } = getSelection(el, text);
    const insertion = before.endsWith('\n') || before === '' ? `${hr.syntax}\n` : `\n${hr.syntax}\n`;
    setText(before + insertion + after);
    focusCursor(el, start + insertion.length);
  }, [hr.syntax, setText, text]);

  // ---- 预设管理 ----
  const handleSelectPreset = useCallback((preset: DevicePreset) => {
    setWidth(preset.width);
    setHeight(preset.height);
    setActivePresetId(preset.id);
  }, []);

  const handleSavePreset = useCallback((name: string) => {
    const id = `custom-${Date.now()}`;
    setCustomPresets((prev) => [
      ...prev,
      { id, name, width, height, category: 'desktop', custom: true },
    ]);
    setActivePresetId(id);
  }, [width, height]);

  const handleToggleAutoFit = useCallback(() => {
    if (autoFit) setManualZoomPct(Math.round(autoScale * 100));
    setAutoFit((prev) => !prev);
  }, [autoFit, autoScale]);

  // ---- 模板 ----
  const doApplyTemplate = useCallback((tpl: TextTemplate) => {
    setText(tpl.content);
    setTemplateOpen(false);
    setConfirmOpen(false);
    setPendingTemplate(null);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(tpl.content.length, tpl.content.length);
      }
    });
  }, [setText]);

  const applyTemplate = useCallback((tpl: TextTemplate) => {
    if (text.trim().length > 0) {
      setPendingTemplate(tpl);
      setConfirmOpen(true);
    } else {
      doApplyTemplate(tpl);
    }
  }, [text, doApplyTemplate]);

  // ---- 键盘快捷键 ----
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Markdown 表格自动补全
      if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) {
        const el = textareaRef.current;
        if (el && el.selectionStart === el.selectionEnd) {
          const pos = el.selectionStart ?? 0;
          const before = text.slice(0, pos);
          const lineStart = before.lastIndexOf('\n') + 1;
          const currentLine = before.slice(lineStart);
          const afterInLine = text.slice(pos).split('\n', 1)[0];
          const trimmed = currentLine.trim();
          const isSepLine = /^\|?[\s:|-]+\|?$/.test(trimmed) && trimmed.includes('-');
          if (
            trimmed.includes('|') &&
            !isSepLine &&
            afterInLine.trim() === '' &&
            !/^\|?[\s:|-]+\|?$/.test(text.slice(pos + afterInLine.length).split('\n')[1]?.trim() ?? '')
          ) {
            const cells = trimmed.replace(/^\|/, '').replace(/\|$/, '').split('|');
            if (cells.length >= 2) {
              e.preventDefault();
              const sep = `| ${cells.map(() => '---').join(' | ')} |`;
              const blank = `| ${cells.map(() => '  ').join(' | ')} |`;
              const insertion = `\n${sep}\n${blank}`;
              setText(before + insertion + text.slice(pos));
              const cursor = pos + insertion.length - 2;
              focusCursor(el, cursor);
              return;
            }
          }
        }
      }

      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((key === 'z' && e.shiftKey) || key === 'y') {
        e.preventDefault();
        redo();
      } else if (key === 'i') {
        e.preventDefault();
        toggleItalicTag();
      }
    },
    [text, undo, redo, toggleItalicTag, setText],
  );

  // ---- 移动端手势 ----
  const handleTouchStart = useCallback<React.TouchEventHandler<HTMLElement | HTMLDivElement>>(
    (e) => {
      if (e.touches.length !== 1) return;
      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    },
    [],
  );

  const handleTouchEnd = useCallback<React.TouchEventHandler<HTMLDivElement>>(
    (e) => {
      const st = touchStart.current;
      touchStart.current = null;
      if (!st || !isMobile || viewMode === 'split') return;
      if (e.currentTarget.scrollWidth > e.currentTarget.clientWidth) return;
      const dx = e.changedTouches[0].clientX - st.x;
      const dy = e.changedTouches[0].clientY - st.y;
      if (Math.abs(dx) < 56 || Math.abs(dy) > 44) return;
      if (dx < 0 && viewMode === 'editor') switchView('preview', 'from-right');
      else if (dx > 0 && viewMode === 'preview') switchView('editor', 'from-left');
    },
    [isMobile, viewMode, switchView],
  );

  // ---- 统计 ----
  const charCount = useMemo(() => text.length, [text]);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
      <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border px-3 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-base font-semibold tracking-tight text-foreground md:text-lg">
              代码叶 Codeleaf
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
          <ViewSwitcher mode={viewMode} onSwitch={switchView} />
          <span className="whitespace-nowrap rounded-full bg-secondary px-2.5 py-1 font-mono text-xs font-medium text-secondary-foreground md:px-3">
            {charCount} 字
          </span>
        </div>
      </header>

      <div className="min-h-0 flex-1 flex flex-col">
        {viewMode === 'split' ? (
          <PanelGroup direction="horizontal" className="min-h-0 flex-1">
            <Panel defaultSize={50} minSize={20} className="min-w-0 min-h-0">
              <EditorSection
                text={text}
                onChange={setText}
                textareaRef={textareaRef}
                scrollRef={editorScrollRef}
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={undo}
                onRedo={redo}
                insertTag={insertTag}
                onToggleItalic={toggleItalicTag}
                onApplyHeading={applyHeading}
                onApplyListStyle={applyListStyle}
                onApplyAlignment={applyAlignment}
                onClearFormat={handleClearFormat}
                onApplyFontSize={applyFontSize}
                onApplyValueTag={applyValueTag}
                onApplyFont={applyFont}
                onApplyWeight={applyWeight}
                onInsertHr={insertHorizontalRule}
                onOpenTemplates={() => setTemplateOpen(true)}
                onImageClick={() => imageInputRef.current?.click()}
                onKeyDown={handleKeyDown}
                search={search}
                uploadingImage={uploadingImage}
                fontSize={fontSize}
                setFontSize={setFontSize}
                letterSpacing={letterSpacing}
                setLetterSpacing={setLetterSpacing}
                lineHeightVal={lineHeightVal}
                setLineHeightVal={setLineHeightVal}
                customHex={customHex}
                customAlpha={customAlpha}
                setCustomHex={setCustomHex}
                setCustomAlpha={setCustomAlpha}
                hr={hr}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              />
            </Panel>
            <PanelResizeHandle className="group relative w-px shrink-0 bg-border">
              <div className="absolute inset-y-0 -left-1 -right-1" />
              <div className="absolute left-1/2 top-1/2 flex h-10 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-card shadow-sm ring-1 ring-border transition-colors group-hover:bg-secondary">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
            </PanelResizeHandle>
            <Panel defaultSize={50} minSize={20} className="min-w-0 min-h-0">
              <PreviewSection
                width={width}
                height={height}
                text={text}
                scale={scale}
                presets={presets}
                activePresetId={activePresetId}
                onWidthChange={(v) => {
                  setWidth(v);
                  setActivePresetId(null);
                }}
                onHeightChange={(v) => {
                  setHeight(v);
                  setActivePresetId(null);
                }}
                onSelectPreset={handleSelectPreset}
                onSavePreset={handleSavePreset}
                autoFit={autoFit}
                onToggleAutoFit={handleToggleAutoFit}
                onManualZoom={setManualZoomPct}
                tableCompact={tableCompact}
                onToggleTableCompact={() => setTableCompact((v) => !v)}
                exporting={exporting}
                onExport={exportPng}
                searchTerm={search.open ? search.term : ''}
                containerRef={containerRef}
                exportRef={exportRef}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              />
            </Panel>
          </PanelGroup>
        ) : viewMode === 'editor' ? (
          <div
            key={`editor-${viewAnim}`}
            className={`h-full w-full min-w-0 overflow-hidden flex flex-col animate-in fade-in duration-200 ${
              viewAnim === 'from-left' ? 'slide-in-from-left-4' : ''
            }`}
          >
            <EditorSection
              text={text}
              onChange={setText}
              textareaRef={textareaRef}
              scrollRef={editorScrollRef}
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={undo}
              onRedo={redo}
              insertTag={insertTag}
              onToggleItalic={toggleItalicTag}
              onApplyHeading={applyHeading}
              onApplyListStyle={applyListStyle}
              onApplyAlignment={applyAlignment}
              onClearFormat={handleClearFormat}
              onApplyFontSize={applyFontSize}
              onApplyValueTag={applyValueTag}
              onApplyFont={applyFont}
              onApplyWeight={applyWeight}
              onInsertHr={insertHorizontalRule}
              onOpenTemplates={() => setTemplateOpen(true)}
              onImageClick={() => imageInputRef.current?.click()}
              onKeyDown={handleKeyDown}
              search={search}
              uploadingImage={uploadingImage}
              fontSize={fontSize}
              setFontSize={setFontSize}
              letterSpacing={letterSpacing}
              setLetterSpacing={setLetterSpacing}
              lineHeightVal={lineHeightVal}
              setLineHeightVal={setLineHeightVal}
              customHex={customHex}
              customAlpha={customAlpha}
              setCustomHex={setCustomHex}
              setCustomAlpha={setCustomAlpha}
              hr={hr}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            />
          </div>
        ) : (
          <div
            key={`preview-${viewAnim}`}
            className={`h-full w-full min-w-0 overflow-hidden flex flex-col animate-in fade-in duration-200 ${
              viewAnim === 'from-right' ? 'slide-in-from-right-4' : ''
            }`}
          >
            <PreviewSection
              width={width}
              height={height}
              text={text}
              scale={scale}
              presets={presets}
              activePresetId={activePresetId}
              onWidthChange={(v) => {
                setWidth(v);
                setActivePresetId(null);
              }}
              onHeightChange={(v) => {
                setHeight(v);
                setActivePresetId(null);
              }}
              onSelectPreset={handleSelectPreset}
              onSavePreset={handleSavePreset}
              autoFit={autoFit}
              onToggleAutoFit={handleToggleAutoFit}
              onManualZoom={setManualZoomPct}
              tableCompact={tableCompact}
              onToggleTableCompact={() => setTableCompact((v) => !v)}
              exporting={exporting}
              onExport={exportPng}
              searchTerm={search.open ? search.term : ''}
              containerRef={containerRef}
              exportRef={exportRef}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            />
          </div>
        )}
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
        className="hidden"
        onChange={handleImageUpload}
      />

      <TemplateDialog
        open={templateOpen}
        onOpenChange={setTemplateOpen}
        onApply={applyTemplate}
        currentText={text}
      />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>替换当前内容？</AlertDialogTitle>
            <AlertDialogDescription>
              应用模版将覆盖编辑区中的现有内容，此操作可通过撤销恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingTemplate) doApplyTemplate(pendingTemplate);
              }}
            >
              确认替换
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TextPreviewer;
