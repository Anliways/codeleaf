/**
 * 渲染模块类型定义
 * 集中管理 Block 结构与样式类型，避免跨文件重复声明
 */

export type Align = 'left' | 'center' | 'right' | 'justify';

export interface Block {
  type:
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'li'
    | 'p'
    | 'container'
    | 'quote'
    | 'table'
    | 'code'
    | 'hr'
    | 'image';
  text: string;
  align?: Align;
  containerKind?: 'columns' | 'card' | 'highlight';
  containerTitle?: string;
  containerLines?: string[];
  quoteLines?: string[];
  codeLang?: string;
  tableHeader?: string[];
  tableRows?: string[][];
  tableAligns?: (Align | undefined)[];
  imageAlt?: string;
  imageUrl?: string;
  hrLineColor?: string;
  hrTextColor?: string;
}

export interface SegmentStyle {
  color?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  superscript?: boolean;
  subscript?: boolean;
  letterSpacing?: number;
  lineHeight?: number;
  fontFamily?: string;
  fontWeight?: number;
}

export interface Segment {
  text: string;
  style: SegmentStyle;
}
