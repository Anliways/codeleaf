import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ClipboardCopy,
  Code2,
  Eraser,
  Italic,
  List,
  ListOrdered,
  Loader2,
  Palette,
  RotateCcw,
  Smartphone,
  Type,
  Underline as UnderlineIcon,
  Undo2,
  Redo2,
  Eye,
  PanelLeftClose,
} from 'lucide-react';
import { toast } from 'sonner';

import { AppNav } from '@/components/common/AppNav';
import PageMeta from '@/components/common/PageMeta';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { DEFAULT_ARTICLE, STYLE_CATEGORIES } from '@/lib/wechat-styles';

const DRAFT_KEY = 'codeleaf:media-draft';

/** 微信正文字号（px），与公众号编辑器常用字号对齐 */
const SIZE_OPTIONS = [
  { label: '14', css: '14px' },
  { label: '15', css: '15px' },
  { label: '16', css: '16px' },
  { label: '17', css: '17px' },
];

const KEYWORD_TO_PX: Array<[string, string]> = [
  ['xx-large', '22px'],
  ['xx-small', '12px'],
  ['x-large', '17px'],
  ['x-small', '12px'],
  ['large', '16px'],
  ['small', '14px'],
  ['medium', '15px'],
];

const PALETTE = [
  '#3f3f3f', '#888888', '#1aad19', '#07c160', '#10aeff',
  '#576b95', '#e64340', '#fa5151', '#ff976a', '#ffc300',
];

/** execCommand 产出的字号关键字统一换算为精确 px；rgb() 颜色转 hex（公众号编辑器更友好） */
const rgbToHex = (html: string) =>
  html.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/g, (_, r, g, b) => {
    const h = (v: string) => Number(v).toString(16).padStart(2, '0');
    return `#${h(r)}${h(g)}${h(b)}`;
  });

const normalizeStyles = (html: string) => rgbToHex(normalizeFontKeywords(html));

const MediaEditor: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** 打开色板/字号弹层前保存的选区（弹层夺焦会折叠选区，执行命令前恢复） */
  const savedRangeRef = useRef<Range | null>(null);

  const [html, setHtml] = useState<string>(DEFAULT_ARTICLE);
  const [charCount, setCharCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit');

  // ---- 初始化：恢复草稿 ----
  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    const initial = saved ?? DEFAULT_ARTICLE;
    if (editorRef.current) editorRef.current.innerHTML = initial;
    setHtml(initial);
    setCharCount(editorRef.current?.innerText.replace(/\s/g, '').length ?? 0);
  }, []);

  // ---- 同步：预览 + 防抖草稿 ----
  const sync = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const next = el.innerHTML;
    setHtml(next);
    setCharCount(el.innerText.replace(/\s/g, '').length);
    setSaving(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, next);
      } catch {
        /* 隐私模式下 localStorage 不可用，静默降级 */
      }
      setSaving(false);
    }, 500);
  }, []);

  const saveSelection = useCallback(() => {
    const s = window.getSelection();
    savedRangeRef.current = s && s.rangeCount > 0 ? s.getRangeAt(0).cloneRange() : null;
  }, []);

  const restoreSelection = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    const s = window.getSelection();
    if (savedRangeRef.current && s) {
      try {
        s.removeAllRanges();
        s.addRange(savedRangeRef.current);
      } catch {
        /* 选区已失效（如内容被重置），忽略 */
      }
    }
  }, []);

  const exec = useCallback(
    (cmd: string, value?: string) => {
      const el = editorRef.current;
      if (!el) return;
      restoreSelection();
      document.execCommand('styleWithCSS', false, 'true');
      document.execCommand(cmd, false, value);
      sync();
    },
    [restoreSelection, sync],
  );

  /** 给选区内文字应用精确 px 字号（execCommand 的关键字字号在公众号编辑器中表现不稳定） */
  const applyFontSize = useCallback(
    (px: string) => {
      const el = editorRef.current;
      const sel = window.getSelection();
      if (!el) return;
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
        toast.error('请先选中要调整的文字');
        return;
      }
      el.focus();
      const range = sel.getRangeAt(0);
      const span = document.createElement('span');
      span.style.fontSize = px;
      try {
        range.surroundContents(span);
      } catch {
        // 选区跨越多个节点时采用「抽取-包裹-回插」
        const frag = range.extractContents();
        span.appendChild(frag);
        range.insertNode(span);
        sel.removeAllRanges();
      }
      sync();
    },
    [sync],
  );

  const insertPreset = useCallback(
    (preset: (typeof STYLE_CATEGORIES)[number]['presets'][number]) => {
      const el = editorRef.current;
      if (!el) return;
      restoreSelection();
      const sel = window.getSelection();
      if (!preset.inline && sel && sel.rangeCount > 0 && !sel.isCollapsed) {
        // 块级样式：折叠选区到末尾，避免误替换已选中的内容
        const range = sel.getRangeAt(0);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
      // 空编辑器时 execCommand 无插入点，直接追加
      if (el.innerText.trim() === '' && el.innerHTML.trim() === '') {
        el.innerHTML = preset.html;
      } else {
        document.execCommand('insertHTML', false, preset.html);
      }
      sync();
      toast.success('样式已插入');
    },
    [restoreSelection, sync],
  );

  // ---- 复制到公众号（富文本，带内联样式） ----
  const copyRich = useCallback(async () => {
    const el = editorRef.current;
    if (!el) return;
    const htmlStr = normalizeStyles(el.innerHTML);
    try {
      const item = new ClipboardItem({
        'text/html': new Blob([htmlStr], { type: 'text/html' }),
        'text/plain': new Blob([el.innerText], { type: 'text/plain' }),
      });
      await navigator.clipboard.write([item]);
      toast.success('已复制排版内容，去公众号后台编辑器 Ctrl+V / ⌘V 粘贴即可');
    } catch {
      // 剪贴板 API 不可用：回退为选区复制（浏览器会复制富文本）
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = window.getSelection();
      if (!sel) return toast.error('复制失败，请手动全选复制');
      sel.removeAllRanges();
      sel.addRange(range);
      document.execCommand('copy');
      sel.removeAllRanges();
      toast.success('已复制排版内容，去公众号后台编辑器粘贴即可');
    }
  }, []);

  // ---- 复制 HTML 源码 ----
  const copySource = useCallback(async () => {
    const el = editorRef.current;
    if (!el) return;
    try {
      await navigator.clipboard.writeText(normalizeStyles(el.innerHTML));
      toast.success('HTML 源码已复制');
    } catch {
      toast.error('复制失败，请重试');
    }
  }, []);

  const clearDraft = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    el.innerHTML = DEFAULT_ARTICLE;
    sync();
    toast.success('已恢复示例文章');
  }, [sync]);

  const toolbarBtn =
    'h-8 w-8 shrink-0 p-0 text-muted-foreground hover:text-foreground';

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
      <PageMeta
        title="自媒体编辑器 - 编码叶 Codeleaf"
        description="微信公众号图文编辑与排版工具：样式库、富文本编辑、手机预览、一键复制到公众号后台。"
      />

      {/* 顶栏 */}
      <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-border px-3 md:h-14 md:px-5">
        <div className="flex min-w-0 items-center gap-2 md:gap-3">
          <span className="truncate text-base font-semibold tracking-tight md:text-lg">
            自媒体编辑
          </span>
          <AppNav />
        </div>
        <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
          <span className="hidden whitespace-nowrap rounded-full bg-secondary px-2.5 py-1 font-mono text-xs font-medium text-secondary-foreground md:inline-block md:px-3">
            {charCount} 字
          </span>
          <span
            className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex"
            aria-live="polite"
          >
            {saving ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" /> 保存中…
              </>
            ) : (
              '已保存'
            )}
          </span>
          <Button
            size="sm"
            className="h-8 gap-1.5 bg-[#07c160] px-2.5 text-xs text-white hover:bg-[#06ad56] md:px-3 md:text-sm"
            onClick={() => void copyRich()}
          >
            <ClipboardCopy className="h-3.5 w-3.5 md:h-4 md:w-4" />
            复制到公众号
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* 左侧样式库 */}
        <aside className="hidden w-52 shrink-0 flex-col overflow-y-auto border-r border-border bg-muted/30 p-3 lg:flex xl:w-60">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">
            样式库（点击插入）
          </p>
          {STYLE_CATEGORIES.map((cat) => (
            <div key={cat.id} className="mb-4">
              <p className="mb-1.5 text-xs font-medium text-foreground/80">
                {cat.label}
              </p>
              <div className="flex flex-col gap-1.5">
                {cat.presets.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => insertPreset(p)}
                    title={`插入：${p.name}`}
                    className="group rounded-lg border border-border bg-background p-2 text-left transition-colors hover:border-[#07c160]/60 hover:shadow-sm"
                  >
                    <span className="mb-1 block text-[11px] text-muted-foreground group-hover:text-[#07c160]">
                      {p.name}
                    </span>
                    <span className="block rounded bg-white p-1.5">
                      <span
                        className="wechat-editor pointer-events-none block max-h-14 overflow-hidden text-[10px] leading-normal"
                        dangerouslySetInnerHTML={{ __html: p.html }}
                      />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </aside>

        {/* 中间：工具栏 + 编辑区 */}
        <section className="flex min-w-0 flex-1 flex-col bg-muted/20">
          {/* 格式工具栏 */}
          <div className="flex min-h-10 shrink-0 items-center gap-0.5 overflow-x-auto border-b border-border px-2 py-1.5 md:px-4">
            <Button variant="ghost" size="sm" className={toolbarBtn} title="加粗" onClick={() => exec('bold')}>
              <Bold className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className={toolbarBtn} title="斜体" onClick={() => exec('italic')}>
              <Italic className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className={toolbarBtn} title="下划线" onClick={() => exec('underline')}>
              <UnderlineIcon className="h-4 w-4" />
            </Button>

            <span className="mx-1 h-5 w-px shrink-0 bg-border" />

            <Popover onOpenChange={(o) => o && saveSelection()}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className={toolbarBtn} title="文字颜色">
                  <Palette className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" side="bottom" align="start">
                <div className="grid grid-cols-5 gap-1.5">
                  {PALETTE.map((c) => (
                    <button
                      key={c}
                      onClick={() => exec('foreColor', c)}
                      className="h-6 w-6 rounded-md border border-black/10 transition-transform hover:scale-110"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Popover onOpenChange={(o) => o && saveSelection()}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className={toolbarBtn} title="字号">
                  <Type className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-1" side="bottom" align="start">
                {SIZE_OPTIONS.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => applyFontSize(s.css)}
                    className="block w-full rounded-md px-4 py-1.5 text-sm hover:bg-accent"
                    style={{ fontSize: s.css }}
                  >
                    {s.label}px
                  </button>
                ))}
              </PopoverContent>
            </Popover>

            <span className="mx-1 h-5 w-px shrink-0 bg-border" />

            <Button variant="ghost" size="sm" className={toolbarBtn} title="左对齐" onClick={() => exec('justifyLeft')}>
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className={toolbarBtn} title="居中" onClick={() => exec('justifyCenter')}>
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className={toolbarBtn} title="右对齐" onClick={() => exec('justifyRight')}>
              <AlignRight className="h-4 w-4" />
            </Button>

            <span className="mx-1 h-5 w-px shrink-0 bg-border" />

            <Button variant="ghost" size="sm" className={toolbarBtn} title="无序列表" onClick={() => exec('insertUnorderedList')}>
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className={toolbarBtn} title="有序列表" onClick={() => exec('insertOrderedList')}>
              <ListOrdered className="h-4 w-4" />
            </Button>

            <span className="mx-1 h-5 w-px shrink-0 bg-border" />

            <Button variant="ghost" size="sm" className={toolbarBtn} title="撤销" onClick={() => exec('undo')}>
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className={toolbarBtn} title="重做" onClick={() => exec('redo')}>
              <Redo2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className={toolbarBtn} title="清除格式" onClick={() => exec('removeFormat')}>
              <Eraser className="h-4 w-4" />
            </Button>

            {/* 移动端：编辑/预览切换 */}
            <span className="mx-1 h-5 w-px shrink-0 bg-border lg:hidden" />
            <Button
              variant="ghost"
              size="sm"
              className={`${toolbarBtn} lg:hidden`}
              title={mobileView === 'edit' ? '预览' : '编辑'}
              onClick={() => setMobileView((v) => (v === 'edit' ? 'preview' : 'edit'))}
            >
              {mobileView === 'edit' ? (
                <Eye className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* 编辑画布 /（移动端）预览 */}
          <div className="min-h-0 flex-1 overflow-y-auto p-3 md:p-6">
            <div
              className={
                'mx-auto w-full max-w-[640px] rounded-xl border border-border bg-white shadow-sm ' +
                (mobileView === 'edit' ? 'block' : 'hidden lg:block')
              }
            >
              <div
                ref={editorRef}
                id="media-editor"
                contentEditable
                suppressContentEditableWarning
                spellCheck={false}
                onInput={sync}
                onBlur={sync}
                data-placeholder="从这里开始撰写你的公众号图文…"
                className="wechat-editor min-h-[60vh] rounded-xl px-5 py-6 md:px-8 md:py-8"
              />
            </div>

            {/* 手机预览（移动端切换显示） */}
            {mobileView === 'preview' && (
              <PhonePreview html={html} className="mx-auto lg:hidden" />
            )}
          </div>
        </section>

        {/* 右侧手机预览（桌面端） */}
        <aside className="hidden w-[380px] shrink-0 flex-col overflow-y-auto border-l border-border bg-muted/30 p-4 xl:flex xl:w-[420px]">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground">
              公众号阅读预览
            </p>
            <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <PhonePreview html={html} />
          <div className="mt-3 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 flex-1 gap-1.5 text-xs"
              onClick={() => void copySource()}
            >
              <Code2 className="h-3.5 w-3.5" />
              复制 HTML 源码
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  重置
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>重置为示例文章？</AlertDialogTitle>
                  <AlertDialogDescription>
                    当前编辑内容将被覆盖为示例文章，此操作不可撤销。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={clearDraft}>
                    确认重置
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            提示：样式全部使用内联 CSS，与公众号编辑器兼容。粘贴后仍可在公众号后台继续微调。返回
            <Link to="/" className="mx-1 text-[#576b95] underline underline-offset-2">
              文本预览
            </Link>
            处理纯文本排版。
          </p>
        </aside>
      </div>
    </div>
  );
};

/** 公众号阅读页样式的手机预览 */
const PhonePreview: React.FC<{ html: string; className?: string }> = ({
  html,
  className = '',
}) => (
  <div
    className={
      'overflow-hidden rounded-[24px] border-4 border-foreground/80 bg-white shadow-lg ' +
      className
    }
  >
    {/* 模拟公众号文章头部 */}
    <div className="border-b border-black/5 bg-white px-4 pb-2 pt-3">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#07c160] text-xs font-bold text-white">
          叶
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-black/80">编码叶 Codeleaf</p>
          <p className="text-[10px] text-black/40">今天 08:00</p>
        </div>
      </div>
    </div>
    <div
      className="wechat-editor min-h-[420px] bg-white px-4 py-4"
      dangerouslySetInnerHTML={{ __html: html }}
    />
    <div className="border-t border-black/5 bg-white px-4 py-3 text-center text-[11px] text-black/35">
      喜欢此内容的人还喜欢 · 微信扫一扫赞赏
    </div>
  </div>
);

export default MediaEditor;
