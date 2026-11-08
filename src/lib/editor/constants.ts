import {
  Table,
  FileText,
  TextQuote,
  ListTodo,
  Columns2,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from 'lucide-react';
import { toLetters, toRoman } from './listFormat';
import type React from 'react';

/**
 * 编辑器常量配置
 * 集中管理颜色、字号、列表样式、插入块、标题、对齐等静态数据
 */

export const PRESET_COLORS = [
  { label: '红色', value: '#FF0000', className: 'bg-red-500' },
  { label: '橙色', value: '#F97316', className: 'bg-orange-500' },
  { label: '黄色', value: '#EAB308', className: 'bg-yellow-500' },
  { label: '绿色', value: '#22C55E', className: 'bg-green-500' },
  { label: '青色', value: '#06B6D4', className: 'bg-cyan-500' },
  { label: '蓝色', value: '#3B82F6', className: 'bg-blue-500' },
  { label: '紫色', value: '#A855F7', className: 'bg-purple-500' },
  { label: '粉色', value: '#EC4899', className: 'bg-pink-500' },
  { label: '黑色', value: '#000000', className: 'bg-black' },
  { label: '白色', value: '#FFFFFF', className: 'bg-white' },
  { label: '深灰', value: '#4B5563', className: 'bg-gray-600' },
  { label: '浅灰', value: '#9CA3AF', className: 'bg-gray-400' },
];

export const PRESET_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

export const MIN_FONT_SIZE = 8;
export const MAX_FONT_SIZE = 72;
export const MIN_SPACING = 0;
export const MAX_SPACING = 20;
export const MIN_LINE_HEIGHT = 1;
export const MAX_LINE_HEIGHT = 3;

export type ListStyleId =
  | 'arabic'
  | 'lower-roman'
  | 'upper-roman'
  | 'lower-letter'
  | 'upper-letter'
  | 'bullet'
  | 'symbol-circle'
  | 'symbol-hollow'
  | 'symbol-star'
  | 'symbol-diamond'
  | 'symbol-square';

export interface ListStyleDef {
  id: ListStyleId;
  label: string;
  sample: string;
  marker: (n: number) => string;
}

export const LIST_STYLES: ListStyleDef[] = [
  { id: 'arabic', label: '阿拉伯数字', sample: '1. 2. 3.', marker: (n) => `${n}.` },
  { id: 'lower-letter', label: '小写字母', sample: 'a. b. c.', marker: (n) => `${toLetters(n, false)}.` },
  { id: 'upper-letter', label: '大写字母', sample: 'A. B. C.', marker: (n) => `${toLetters(n, true)}.` },
  { id: 'lower-roman', label: '小写罗马', sample: 'i. ii. iii.', marker: (n) => `${toRoman(n, false)}.` },
  { id: 'upper-roman', label: '大写罗马', sample: 'I. II. III.', marker: (n) => `${toRoman(n, true)}.` },
  { id: 'bullet', label: '圆点符号', sample: '- - -', marker: () => '-' },
  { id: 'symbol-circle', label: '实心圆', sample: '● ● ●', marker: () => '●' },
  { id: 'symbol-hollow', label: '空心圆', sample: '○ ○ ○', marker: () => '○' },
  { id: 'symbol-star', label: '星形', sample: '★ ★ ★', marker: () => '★' },
  { id: 'symbol-diamond', label: '菱形', sample: '◆ ◆ ◆', marker: () => '◆' },
  { id: 'symbol-square', label: '方块', sample: '■ ■ ■', marker: () => '■' },
];

export interface InsertBlockDef {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  snippet: string;
}

export const INSERT_BLOCKS: InsertBlockDef[] = [
  {
    id: 'table',
    label: '表格',
    icon: Table,
    snippet: '| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| 内容 | 内容 | 内容 |\n',
  },
  {
    id: 'plaintext',
    label: '纯文本块',
    icon: FileText,
    snippet: '```plaintext\n纯文本内容\n```\n',
  },
  {
    id: 'quote',
    label: '引用',
    icon: TextQuote,
    snippet: '> 引用内容\n',
  },
  {
    id: 'task',
    label: '任务列表',
    icon: ListTodo,
    snippet: '- [ ] 待办事项\n- [x] 已完成事项\n',
  },
  {
    id: 'columns',
    label: '多栏排版',
    icon: Columns2,
    snippet: '::: columns\n第一栏内容\n\n第二栏内容\n:::\n',
  },
  {
    id: 'highlight',
    label: '高亮块',
    icon: Highlighter,
    snippet: '::: highlight\n需要强调展示的内容\n:::\n',
  },
];

export const HEADING_LEVELS = [
  { level: 0, label: '普通文本' },
  { level: 1, label: 'H1 标题' },
  { level: 2, label: 'H2 标题' },
  { level: 3, label: 'H3 标题' },
  { level: 4, label: 'H4 标题' },
  { level: 5, label: 'H5 标题' },
  { level: 6, label: 'H6 标题' },
];

export type AlignId = 'left' | 'center' | 'right' | 'justify';

export const ALIGN_OPTIONS = [
  { id: 'left' as AlignId, label: '左对齐', icon: AlignLeft },
  { id: 'center' as AlignId, label: '居中对齐', icon: AlignCenter },
  { id: 'right' as AlignId, label: '右对齐', icon: AlignRight },
  { id: 'justify' as AlignId, label: '两端对齐', icon: AlignJustify },
];

// 移除文本中的所有富文本标签
export const stripFormatTags = (input: string): string =>
  input.replace(/<\/?(color|size|b|i|u|s|strong|em|sup|sub|spacing|lh|font|weight)=?[^>]*>/gi, '');
