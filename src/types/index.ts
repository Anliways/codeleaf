export interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  withCount?: boolean;
}

// 自定义模板：编辑区内容连同内联排版标签（字体/字号/颜色/对齐/加粗/斜体等）一并持久化
export interface CustomTemplate {
  id: string;
  name: string;
  content: string;
  created_at: string;
}
