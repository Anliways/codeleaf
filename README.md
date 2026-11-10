# Codeleaf · 编码叶

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6.svg)](https://www.typescriptlang.org)

**[English](#english) | [中文](#中文说明)**

A real-time text editor with instant rich-text preview. Type on the left, see it rendered on the right — with pixel-perfect device preview, layout containers, custom templates and one-click PNG export.

🌐 **Live Demo**: [https://anliways.github.io/codeleaf/](https://anliways.github.io/codeleaf/)

---

<a id="english"></a>

## ✨ Features

- **Real-time split preview** — resizable editor/preview panes (drag to adjust), switchable between split, editor-only and preview-only views.
- **Inline rich-text tags** — bold, italic, underline, strikethrough, text/background color, font size & weight, letter spacing, line height, superscript & subscript, paragraph alignment.
- **Markdown-style block syntax** — headings, ordered / unordered / task lists, block quotes, tables with column alignment, fenced code blocks with syntax highlighting and a one-click copy button, customizable horizontal rules (line color, text, alignment).
- **Layout containers** — `card`, `columns` (multi-column) and `highlight` blocks for modular page layouts.
- **Device-accurate preview** — built-in presets for phones, tablets, foldables, desktops and common aspect ratios, plus custom width/height, zoom control and auto-fit mode.
- **Editing tools** — undo/redo history, find & replace with in-canvas match highlighting.
- **Image upload** — automatic compression to WebP (≤ 1 MB) before uploading to Supabase Storage.
- **Templates** — 6 built-in starter templates; save the current document (with all formatting tags) as your own custom template, stored in Supabase.
- **PNG export** — one-click export of the rendered result as a long PNG image.
- **Theming** — light & dark styles driven by CSS variables (Tailwind CSS `darkMode: 'class'`).

## 🛠 Tech Stack

React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui (Radix UI) · Supabase · react-resizable-panels · react-router · html-to-image

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 20
- npm ≥ 10

### 1. Clone and install

```bash
git clone https://github.com/Anliways/codeleaf.git
cd codeleaf
npm install
```

### 2. Configure environment variables

Copy the template and fill in your own Supabase project credentials:

```bash
cp .env.example .env.local
```

| Variable | Description |
| --- | --- |
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon (public) key |
| `VITE_SENTRY_DSN` | Optional. Sentry DSN for error reporting; leave empty to disable |

> You can create a free project at [supabase.com](https://supabase.com) or self-host the open-source Supabase. The URL and anon key are found in your project settings (API section).

### 3. Set up the database

Run the two SQL migrations in `supabase/migrations/` from the Supabase SQL editor (or your own migration tool):

- `00001_create_custom_templates.sql` — creates the `custom_templates` table used by the custom-template feature
- `00002_create_codeleaf_images_bucket.sql` — creates the `codeleaf-images` storage bucket used by image upload

Without these, the app still runs, but template saving and image uploading will not work.

### 4. Start developing

```bash
npm run dev        # dev server → http://localhost:5173
npm run build      # production build to dist/
npm run preview    # preview the production build
npm run lint       # type check + Biome lint + ast-grep rules + build check
```

## 📦 Deployment

The repository ships with a GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) that publishes the site to **GitHub Pages** automatically on every push to `main`. No extra configuration is needed beyond enabling Pages from GitHub Actions in the repository settings.

### One-command dual deployment

The project is published to two places: `anliways.github.io/codeleaf/` (GitHub Pages, built from source) and `www.anliways.com/codeleaf/` (Vercel, served as a self-contained single-file build from the `Anliways/anliways-site` repository).

```bash
npm run deploy            # build -> push source -> sync single-file -> verify both URLs
npm run deploy -- --no-push   # skip pushing the source repository
```

The script (`scripts/sync-site.sh`) builds `dist/`, generates `dist-singlefile/index.html` via `vite.singlefile.config.ts`, commits/pushes this repository, then overwrites `codeleaf/index.html` in `anliways-site` and verifies both URLs contain the expected content.

### Optional: fully automatic sync

Add a repository secret `SITE_SYNC_TOKEN` (fine-grained PAT with *Contents: read and write* on `Anliways/anliways-site`). The workflow `.github/workflows/sync-singlefile.yml` will then push the single-file build to the Vercel site on every push to `main`. Without the secret the workflow skips silently, so it is safe to leave unconfigured.

## 📁 Project Structure

```
├── index.html              # Vite entry
├── public/                 # Static assets (favicon, images)
├── supabase/migrations/    # Database migrations (SQL)
├── docs/                   # Product docs (PRD, design notes)
├── .rules/                 # ast-grep lint rules & check scripts
└── src/
    ├── main.tsx            # App entry
    ├── App.tsx             # Root component & routing
    ├── routes.tsx          # Route configuration
    ├── api/                # Backend API calls (custom template CRUD)
    ├── components/
    │   ├── common/         # Shared components (PageMeta, MobileGate, …)
    │   ├── editor/         # Editor pane (incl. toolbar/ sub-components)
    │   ├── preview/        # Preview pane & device canvas
    │   └── ui/             # shadcn/ui primitives
    ├── contexts/           # React contexts (auth)
    ├── db/                 # Supabase client
    ├── hooks/              # Custom hooks (history, export, upload, …)
    ├── lib/                # Render engine (parser/renderer), presets, templates
    │   └── editor/         # Editor constants, default text, selection, image utils
    ├── pages/              # Pages (TextPreviewer)
    └── types/              # Type definitions
```

## 🤝 Contributing

Issues and pull requests are welcome. For significant changes, please open an issue first to discuss what you would like to change.

## 📄 License

Distributed under the [MIT License](LICENSE).

---

<a id="中文说明"></a>

# Codeleaf · 编码叶（中文说明）

一个实时文本编辑与预览工具：左侧编辑、右侧即时渲染，提供像素级设备预览、排版容器、自定义模板与一键 PNG 导出。

🌐 **在线演示**：[https://anliways.github.io/codeleaf/](https://anliways.github.io/codeleaf/)

## ✨ 功能特性

- **实时分栏预览** — 编辑区 / 预览区可拖拽调节宽度，支持双栏、仅编辑、仅预览三种视图切换。
- **行内富文本标签** — 加粗、斜体、下划线、删除线、文字/背景颜色、字号字重、字间距、行高、上下标、段落对齐。
- **Markdown 风格块级语法** — 标题、有序/无序/任务列表、引用块、可对齐表格、围栏代码块（语法高亮 + 一键复制）、可自定义样式的分割线（线条颜色、文字、对齐）。
- **排版容器** — `card` 卡片、`columns` 多栏、`highlight` 高亮三种容器，支持模块化排版。
- **设备级预览** — 内置手机、平板、折叠屏、桌面、常见比例等尺寸预设，支持自定义宽高、缩放控制与自适应模式。
- **编辑工具** — 撤销/重做历史、查找替换（画布内匹配高亮）。
- **图片上传** — 上传前自动压缩为 WebP（≤ 1 MB），存入 Supabase Storage。
- **模板系统** — 内置 6 个起步模板；可将当前文档（连同全部排版标签）保存为自定义模板，持久化到 Supabase。
- **PNG 导出** — 一键将渲染结果导出为 PNG 长图。
- **主题样式** — 基于 CSS 变量的亮色 / 暗色两套样式（Tailwind CSS `darkMode: 'class'`）。

## 🛠 技术栈

React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui（Radix UI）· Supabase · react-resizable-panels · react-router · html-to-image

## 🚀 快速开始

### 环境要求

- Node.js ≥ 20
- npm ≥ 10

### 1. 克隆并安装依赖

```bash
git clone https://github.com/Anliways/codeleaf.git
cd codeleaf
npm install
```

### 2. 配置环境变量

复制模板文件并填入你自己的 Supabase 项目凭据：

```bash
cp .env.example .env.local
```

| 变量 | 说明 |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase 项目地址 |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon（公开）密钥 |
| `VITE_SENTRY_DSN` | 可选。Sentry 错误上报 DSN，留空则关闭 |

> 可在 [supabase.com](https://supabase.com) 免费创建项目，或自行部署开源版 Supabase。项目地址与 anon 密钥位于项目设置的 API 页面。

### 3. 初始化数据库

在 Supabase SQL 编辑器（或你自己的迁移工具）中依次执行 `supabase/migrations/` 下的两个 SQL 迁移：

- `00001_create_custom_templates.sql` — 创建自定义模板功能所需的 `custom_templates` 表
- `00002_create_codeleaf_images_bucket.sql` — 创建图片上传所需的 `codeleaf-images` 存储桶

未初始化时应用仍可运行，但保存模板与上传图片功能不可用。

### 4. 启动开发

```bash
npm run dev        # 开发服务器 → http://localhost:5173
npm run build      # 生产构建，输出到 dist/
npm run preview    # 预览生产构建
npm run lint       # 类型检查 + Biome lint + ast-grep 规则 + 构建校验
```

## 📦 部署

仓库内置 GitHub Actions 工作流（`.github/workflows/deploy-pages.yml`），每次向 `main` 分支推送都会自动发布到 **GitHub Pages**。只需在仓库设置中将 Pages 来源启用为 GitHub Actions，无需其他配置。

### 一条命令双站发布

本项目发布到两个位置：`anliways.github.io/codeleaf/`（GitHub Pages，源码构建）与 `www.anliways.com/codeleaf/`（Vercel，托管 `Anliways/anliways-site` 仓库中的自包含单文件产物）。

```bash
npm run deploy              # 构建 → 推送源码 → 同步单文件 → 校验两个线上地址
npm run deploy -- --no-push # 只构建与同步单文件，不推送源码仓库
```

脚本 `scripts/sync-site.sh` 依次完成：构建 `dist/` → 用 `vite.singlefile.config.ts` 生成 `dist-singlefile/index.html` → 提交并推送本仓库 → 覆盖 `anliways-site/codeleaf/index.html` 并推送 → 校验两个线上地址均已包含最新内容。

### 可选：完全自动同步

在仓库 Secrets 中添加 `SITE_SYNC_TOKEN`（对 `Anliways/anliways-site` 具有 **Contents: read and write** 权限的细粒度 PAT）。此后每次推送 `main`，工作流 `.github/workflows/sync-singlefile.yml` 会自动把单文件产物同步到 Vercel 子站。未配置该 Secret 时工作流会静默跳过，不影响 GitHub Pages 部署。

## 📁 项目结构

```
├── index.html              # Vite 入口
├── public/                 # 静态资源（favicon、图片）
├── supabase/migrations/    # 数据库迁移（SQL）
├── docs/                   # 产品文档（PRD、设计说明）
├── .rules/                 # ast-grep 检查规则与脚本
└── src/
    ├── main.tsx            # 应用入口
    ├── App.tsx             # 根组件与路由挂载
    ├── routes.tsx          # 路由配置
    ├── api/                # 后端接口（自定义模板 CRUD）
    ├── components/
    │   ├── common/         # 通用组件（PageMeta、MobileGate 等）
    │   ├── editor/         # 编辑区组件（含 toolbar/ 工具栏子组件）
    │   ├── preview/        # 预览区与设备画布
    │   └── ui/             # shadcn/ui 基础组件
    ├── contexts/           # React Context（认证）
    ├── db/                 # Supabase 客户端
    ├── hooks/              # 自定义 Hooks（历史、导出、上传等）
    ├── lib/                # 渲染引擎（解析/渲染）、预设、模板
    │   └── editor/         # 编辑器常量、默认文本、选区、图片工具
    ├── pages/              # 页面（TextPreviewer）
    └── types/              # 类型定义
```

## 🤝 参与贡献

欢迎提交 Issue 与 Pull Request。如需进行较大改动，请先开 Issue 讨论你计划变更的内容。

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源。
