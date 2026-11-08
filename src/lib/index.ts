/**
 * 渲染模块统一出口
 * 保持默认导出 RenderedText 以兼容既有导入路径
 */
export { default } from './render';
export { parseBlocks, TABLE_SEPARATOR_RE, TASK_ITEM_RE } from './parser';
export { isValidColor, alphaToHex, composeHex8, CHECKERBOARD_BG } from './color';
export type { Block, Segment, SegmentStyle, Align } from './types';
