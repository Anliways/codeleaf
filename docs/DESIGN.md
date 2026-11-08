---
name: 暗夜专注
source_draft: 2
fonts:
  heading: "HarmonyOSSans"
  body: "HarmonyOSSans"
tokens:
  radius: "0.75rem"
  background: "0 0% 16%"
  foreground: "0 0% 96%"
  card: "0 0% 20%"
  card-foreground: "0 0% 96%"
  primary: "0 0% 96%"
  primary-foreground: "0 0% 16%"
  secondary: "0 0% 24%"
  secondary-foreground: "0 0% 96%"
  muted: "0 0% 24%"
  muted-foreground: "0 0% 65%"
  accent: "0 0% 24%"
  accent-foreground: "0 0% 96%"
  destructive: "0 72% 55%"
  destructive-foreground: "0 0% 100%"
  border: "0 0% 28%"
  input: "0 0% 28%"
  ring: "0 0% 96%"
  popover: "0 0% 20%"
  popover-foreground: "0 0% 96%"
section_blueprint:
  editor: "flex min-w-0 flex-1 flex-col bg-background"
  preview: "flex min-w-0 flex-1 flex-col bg-card"
---

## Overview

暗夜专注是一套以深灰阶为核心的暗色编辑器界面，灵感来自专业代码编辑器与苹果式克制美学。整体采用纯灰阶（黑、深灰、浅灰、白）构成，刻意去除任何彩色，让用户的注意力完全落在文本内容本身。signature 元素是编辑器与预览区之间的发丝级分割手柄，以及预览区顶部的像素级尺寸控制条。

## Colors

严格控制在 4 档灰阶以内：背景 `#292929`（L 16%）、卡片 `#333333`（L 20%）、次级 `#3D3D3D`（L 24%）、前景 `#F5F5F5`（L 96%）。`primary` 为浅色（L 96%），用于品牌图标底色与主操作按钮，`primary-foreground` 为深色。`muted-foreground`（L 65%）用于次要文字与行号。`border`（L 28%）用于所有分隔线。`destructive` 为唯一的暗红色，仅用于错误提示。不使用任何渐变，大面积区域均为中性深灰底。

## Typography

正文与标题统一使用 HarmonyOSSans（思源黑体改造），代码与数值输入使用 Source Han Mono SC 等宽字体。正文字号 14px，行高 1.5；标题 18-24px，字重 600-700。行号使用等宽字体并降低透明度至 50%，形成安静的辅助层。所有数值（尺寸、字数）使用等宽字体保证对齐。

## Layout

桌面优先的左右分栏布局，使用可拖拽分割面板。顶部 56px 标题栏，下方为编辑区与预览区，中间为 1px 发丝分割手柄。预览区内部自上而下为：40px 子标题栏、尺寸控制条、可滚动画布。画布内为固定像素尺寸的预览框，居中显示，超出时画布滚动。本应用仅支持 PC Web 端，在移动设备上访问时显示不兼容提示页面，不提供移动端布局。

## Components

- **分割手柄**：1px 竖线 + 居中圆形抓取钮，hover 时背景加深。
- **尺寸控制条**：紧凑横排，含宽度/高度数值输入（带 px 后缀）、设备预设下拉、保存预设按钮。
- **预览画布**：固定 width×height 的圆角框，内容溢出时内部滚动，外部画布居中并可滚动。
- **行号编辑器**：等宽字体，行号右对齐、低透明度，与正文同行高对齐。
- **主按钮**：`bg-primary text-primary-foreground`，仅用于品牌图标底色；次要操作用 `variant="secondary"`。

## Do's and Don'ts

- 禁止任何彩色（蓝/紫/绿等），所有强调仅靠灰阶明度对比。
- 禁止渐变文字与紫蓝渐变背景。
- 禁止 emoji 作为图标，统一使用 lucide-react 线性图标。
- 预设下拉使用 shadcn Select，禁止原生 `<select>`。
- 错误提示使用 sonner toast，禁止 alert/confirm。