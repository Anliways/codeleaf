import React from 'react';
import type { Align, Block, Segment, SegmentStyle } from './types';
import { parseBlocks, splitListMarker, TASK_ITEM_RE } from './parser';
import { parseInline, hasSegmentStyle } from './inline';
import { CodeCopyButton } from './components';

/**
 * 富文本渲染器
 * 将 Block 数组渲染为 React 节点，支持查找高亮与表格紧凑模式
 */

interface RenderedTextProps {
  text: string;
  searchTerm?: string;
  tableCompact?: boolean;
}

const alignClass = (align?: Align): React.CSSProperties =>
  align ? { textAlign: align } : {};

const highlightKeyword = (text: string, term?: string): React.ReactNode => {
  if (!term) return text;
  const lower = text.toLowerCase();
  const needle = term.toLowerCase();
  const nodes: React.ReactNode[] = [];
  let i = 0;
  let k = 0;
  let idx = lower.indexOf(needle, i);
  while (idx !== -1) {
    if (idx > i) nodes.push(text.slice(i, idx));
    nodes.push(
      <mark
        key={`hl-${k++}`}
        className="rounded-sm bg-primary/40 text-inherit"
      >
        {text.slice(idx, idx + needle.length)}
      </mark>,
    );
    i = idx + needle.length;
    idx = lower.indexOf(needle, i);
  }
  nodes.push(text.slice(i));
  return nodes;
};

const renderSegmentsBase = (
  segments: Segment[],
  baseClass: string,
  searchTerm?: string,
): React.ReactNode => {
  if (segments.length === 1 && !hasSegmentStyle(segments[0].style)) {
    return highlightKeyword(segments[0].text, searchTerm);
  }
  return segments.map((seg, i) => {
    const s = seg.style;
    if (!hasSegmentStyle(s)) {
      return <span key={i}>{highlightKeyword(seg.text, searchTerm)}</span>;
    }

    const style: React.CSSProperties = {};
    if (s.color) style.color = s.color;
    if (s.bold || s.fontWeight !== undefined) {
      style.fontWeight = s.fontWeight ?? 700;
    }
    if (s.italic) style.fontStyle = 'italic';
    if (s.fontFamily) style.fontFamily = s.fontFamily;
    if (s.letterSpacing !== undefined) {
      style.letterSpacing = `${s.letterSpacing}px`;
    }
    if (s.fontSize !== undefined) {
      style.fontSize = `${s.fontSize}px`;
      style.lineHeight = `${s.fontSize * 1.5}px`;
    }
    if (s.superscript || s.subscript) {
      style.verticalAlign = s.superscript ? 'super' : 'sub';
      style.fontSize =
        s.fontSize !== undefined ? `${s.fontSize * 0.75}px` : 'smaller';
    }
    if (s.lineHeight !== undefined) {
      style.lineHeight = s.lineHeight;
      style.display = 'inline-block';
    }

    const decorations: string[] = [];
    if (s.underline) decorations.push('underline');
    if (s.strikethrough) decorations.push('line-through');
    if (decorations.length > 0) style.textDecoration = decorations.join(' ');

    return (
      <span key={i} style={style} className={baseClass}>
        {highlightKeyword(seg.text, searchTerm)}
      </span>
    );
  });
};

const headingClassMap: Record<
  string,
  { wrap: string; span: string; margin: string }
> = {
  h1: {
    wrap: 'mt-10 mb-2 first:mt-0',
    span: 'text-3xl font-bold leading-tight tracking-tight text-foreground',
    margin: 'mt-10 mb-2 first:mt-0',
  },
  h2: {
    wrap: 'mt-8 mb-2 first:mt-0',
    span: 'text-2xl font-semibold leading-snug text-foreground',
    margin: 'mt-8 mb-2 first:mt-0',
  },
  h3: {
    wrap: 'mt-6 mb-1.5 first:mt-0',
    span: 'text-xl font-semibold leading-snug text-foreground',
    margin: 'mt-6 mb-1.5 first:mt-0',
  },
  h4: {
    wrap: 'mt-5 mb-1 first:mt-0',
    span: 'text-base font-semibold leading-normal text-foreground',
    margin: 'mt-5 mb-1 first:mt-0',
  },
  h5: {
    wrap: 'mt-4 mb-1 first:mt-0',
    span:
      'text-sm font-semibold uppercase tracking-wide text-muted-foreground',
    margin: 'mt-4 mb-1 first:mt-0',
  },
  h6: {
    wrap: 'mt-4 mb-1 first:mt-0',
    span: 'text-sm font-medium text-muted-foreground',
    margin: 'mt-4 mb-1 first:mt-0',
  },
};

const RenderedText: React.FC<RenderedTextProps> = ({
  text,
  searchTerm,
  tableCompact = false,
}) => {
  const blocks = React.useMemo(() => parseBlocks(text), [text]);

  const renderBlocks = (blockList: Block[], keyPrefix: string): React.ReactNode[] => {
    const out: React.ReactNode[] = [];
    let listBuffer: string[] = [];

    const flushList = (k: string) => {
      if (listBuffer.length === 0) return;
      out.push(
        <ul key={k} className="mt-2 space-y-1.5 text-sm leading-relaxed text-foreground">
          {listBuffer.map((item, i) => {
            const { marker, content } = splitListMarker(item);
            const task = TASK_ITEM_RE.exec(content);
            if (task) {
              const checked = task[1].toLowerCase() === 'x';
              return (
                <li key={i} className="flex items-start gap-2">
                  <span
                    className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      checked
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground/50 bg-background'
                    }`}
                  >
                    {checked ? (
                      <span className="text-[10px] leading-none">✓</span>
                    ) : null}
                  </span>
                  <span className="min-w-0 break-words">
                    {renderSegmentsBase(
                      parseInline(task[2], {}),
                      checked
                        ? 'text-sm leading-relaxed text-muted-foreground line-through'
                        : 'text-sm leading-relaxed text-foreground',
                      searchTerm,
                    )}
                  </span>
                </li>
              );
            }
            return (
              <li key={i} className="flex items-start gap-2">
                {marker ? (
                  <span className="shrink-0 font-mono text-xs font-medium leading-6 text-primary">
                    {marker}
                  </span>
                ) : (
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-foreground" />
                )}
                <span className="min-w-0 break-words">
                  {renderSegmentsBase(
                    parseInline(content, {}),
                    'text-sm leading-relaxed text-foreground',
                    searchTerm,
                  )}
                </span>
              </li>
            );
          })}
        </ul>,
      );
      listBuffer = [];
    };

    for (let i = 0; i < blockList.length; i++) {
      const block = blockList[i];
      const key = `${keyPrefix}-${i}`;
      const style = alignClass(block.align);

      if (block.type === 'container') {
        flushList(`${key}-list`);
        const inner = parseBlocks((block.containerLines ?? []).join('\n'));
        if (block.containerKind === 'columns') {
          out.push(
            <div
              key={key}
              style={{ columnCount: 2, columnGap: '1.25rem' }}
              className="mt-2"
            >
              {renderBlocks(inner, `${key}-col`).map((node, j) => (
                <div key={j} style={{ breakInside: 'avoid' }}>
                  {node}
                </div>
              ))}
            </div>,
          );
        } else if (block.containerKind === 'highlight') {
          out.push(
            <div
              key={key}
              className="mt-2 rounded-lg border border-primary/40 bg-primary/10 p-4"
            >
              {block.containerTitle ? (
                <div className="mb-2 text-sm font-semibold text-primary">
                  {block.containerTitle}
                </div>
              ) : null}
              {renderBlocks(inner, `${key}-hl`)}
            </div>,
          );
        } else {
          out.push(
            <div
              key={key}
              className="mt-2 rounded-lg border border-border bg-muted/40 p-4"
            >
              {block.containerTitle ? (
                <div className="mb-2 text-sm font-semibold text-foreground">
                  {block.containerTitle}
                </div>
              ) : null}
              {renderBlocks(inner, `${key}-card`)}
            </div>,
          );
        }
        continue;
      }

      if (block.type === 'code') {
        flushList(`${key}-list`);
        const isPlaintext = block.codeLang === 'plaintext' || block.codeLang === 'text';
        if (isPlaintext) {
          out.push(
            <div
              key={key}
              className="group relative mt-2 rounded-lg border border-border bg-muted/30 px-4 py-3"
            >
              <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-muted-foreground">
                {block.text}
              </pre>
              <CodeCopyButton code={block.text} />
            </div>,
          );
          continue;
        }
        out.push(
          <div
            key={key}
            className="group relative mt-2 overflow-hidden rounded-lg border border-border bg-background/80"
          >
            {block.codeLang ? (
              <div className="border-b border-border px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {block.codeLang}
              </div>
            ) : null}
            <pre className="overflow-x-auto scroll-smooth whitespace-pre p-4 font-mono text-xs leading-normal text-foreground">
              {block.text}
            </pre>
            <CodeCopyButton code={block.text} />
          </div>,
        );
        continue;
      }

      if (block.type === 'quote') {
        flushList(`${key}-list`);
        out.push(
          <blockquote
            key={key}
            style={style}
            className="mt-2 rounded-r-md border-l-2 border-primary/60 bg-muted/40 py-2 pl-3 pr-3"
          >
            {(block.quoteLines ?? []).map((ql, qi) => (
              <div
                key={`${key}-q${qi}`}
                className="text-sm leading-relaxed text-muted-foreground"
              >
                {ql === '' ? (
                  <span className="block h-2" />
                ) : (
                  renderSegmentsBase(
                    parseInline(ql, {}),
                    'text-sm leading-relaxed text-muted-foreground',
                    searchTerm,
                  )
                )}
              </div>
            ))}
          </blockquote>,
        );
        continue;
      }

      if (block.type === 'table') {
        flushList(`${key}-list`);
        const aligns = block.tableAligns ?? [];
        const cellClass = tableCompact ? 'px-2 py-1' : 'px-3 py-2';
        const bodyCellClass = tableCompact ? 'px-2 py-0.5' : 'px-3 py-1.5';
        out.push(
          <div key={key} className="mt-2 overflow-x-auto rounded-lg border border-border">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-muted/60">
                  {(block.tableHeader ?? []).map((cell, ci) => (
                    <th
                      key={`${key}-h${ci}`}
                      style={{ textAlign: aligns[ci] ?? 'left' }}
                      className={`whitespace-nowrap border-b border-border font-semibold text-foreground ${cellClass}`}
                    >
                      {renderSegmentsBase(
                        parseInline(cell, {}),
                        'font-semibold text-foreground',
                        searchTerm,
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(block.tableRows ?? []).map((row, ri) => (
                  <tr
                    key={`${key}-r${ri}`}
                    className="transition-colors odd:bg-muted/20 hover:bg-muted/60"
                  >
                    {row.map((cell, ci) => (
                      <td
                        key={`${key}-r${ri}-c${ci}`}
                        style={{ textAlign: aligns[ci] ?? 'left' }}
                        className={`whitespace-nowrap border-b border-border/50 text-muted-foreground ${bodyCellClass}`}
                      >
                        {renderSegmentsBase(
                          parseInline(cell, {}),
                          'text-muted-foreground',
                          searchTerm,
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>,
        );
        continue;
      }

      if (block.type === 'li') {
        listBuffer.push(block.text);
        continue;
      }

      if (block.type === 'hr') {
        flushList(`${key}-list`);
        const lineColor = block.hrLineColor || 'var(--border)';
        const textColor = block.hrTextColor || 'var(--muted-foreground)';
        const hrAlign = block.align ?? 'center';

        if (block.text === '') {
          out.push(
            <div key={key} className="my-3">
              <div
                style={{ backgroundColor: lineColor }}
                className="h-px w-full"
              />
            </div>,
          );
          continue;
        }

        const lineEl = (
          <div
            style={{ backgroundColor: lineColor }}
            className="h-px flex-1"
          />
        );
        out.push(
          <div key={key} className="my-3 flex items-center gap-2">
            {hrAlign !== 'left' ? lineEl : null}
            <span
              style={{ color: textColor }}
              className="whitespace-nowrap text-[11px] font-medium tracking-wide"
            >
              {block.text}
            </span>
            {hrAlign !== 'right' ? lineEl : null}
          </div>,
        );
        continue;
      }

      if (block.type === 'image') {
        flushList(`${key}-list`);
        out.push(
          <figure
            key={key}
            style={style}
            className="group relative mt-2 overflow-hidden rounded-lg border border-border bg-muted/20"
          >
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={block.imageUrl}
                alt={block.imageAlt || '图片'}
                loading="lazy"
                className="h-full w-full object-contain"
              />
            </div>
          </figure>,
        );
        continue;
      }

      flushList(`${key}-list`);

      if (block.type === 'p') {
        if (block.text === '') {
          out.push(<div key={key} className="h-3" />);
        } else {
          out.push(
            <div key={key} style={style} className="mt-2">
              <span className="text-sm leading-relaxed text-muted-foreground">
                {renderSegmentsBase(
                  parseInline(block.text, {}),
                  'text-sm leading-relaxed text-muted-foreground',
                  searchTerm,
                )}
              </span>
            </div>,
          );
        }
        continue;
      }

      const heading = headingClassMap[block.type];
      if (heading) {
        out.push(
          <div key={key} style={style} className={heading.margin}>
            <span className={heading.span}>
              {renderSegmentsBase(
                parseInline(block.text, {}),
                heading.span,
                searchTerm,
              )}
            </span>
          </div>,
        );
      }
    }

    flushList(`${keyPrefix}-list-end`);
    return out;
  };

  return <div className="space-y-0">{renderBlocks(blocks, 'root')}</div>;
};

export default RenderedText;
