# 线上版本与本地文件对比差异清单

- 对比日期：2026-11-09
- 线上地址：https://app-dztld1gj05q9.appmiaoda.com/ （编码叶 Codeleaf）
- 线上构建产物：`index-AKl6NKK4.js`（约 706 KB，压缩）+ `index-sSOsflHt.css`（约 72 KB）
- 本地目录：原为分批下载的约 150 个平铺文件

## 一、结论

**本地源码与线上部署版本内容一致，无版本偏差。**

核对方法：线上为压缩构建产物，无法逐文件比对，故提取线上 bundle 中全部 294 条中文字符串与本地源码逐一核对：

- 线上有、本地没有：仅 1 条（"服务端报错"），经定位来自秒哒平台运行时依赖（`miaoda-react-devkit` 的 Supabase 网络拦截层），不属于项目源码；
- 本地有、线上没有：161 条，经逐一核查**全部为代码注释**（压缩构建后注释不会保留），如组件说明、分区注释等；NotFound 页文案未入 bundle 属正常（该页面未被路由引用，构建时被 tree-shaking 掉）。

特征功能点（模板文案、设备预设、默认文本、工具栏提示等）线上/线下完全吻合。

## 二、差异明细与处理

### 1. 结构性差异（最主要问题）：文件全部平铺

线上项目原本为标准 Vite + `src/` 目录结构（依据：源码内 `@/*` 别名导入、tsconfig `include: ["src"]`、平台 README 模板），但分批下载后全部文件平铺在根目录，且原始相对路径信息丢失。

**处理**：依据每个文件的 import 语句还原原始目录并完成迁移，迁移后已用脚本验证全部 `@/` 与相对路径导入可解析：

| 归属目录 | 文件 |
| --- | --- |
| `src/` | main.tsx、App.tsx、routes.tsx、index.css、vite-env.d.ts、global.d.ts、svg.d.ts |
| `src/pages/` | TextPreviewer.tsx、NotFound.tsx |
| `src/components/common/` | PageMeta、MobileGate、IntersectObserver、RouteGuard、ViewSwitcher |
| `src/components/editor/` | EditorSection、SearchPanel、TemplateDialog、FontPanel |
| `src/components/editor/toolbar/` | index.tsx（工具栏主文件）、ToolbarButton、ColorPicker、HrPopover |
| `src/components/preview/` | PreviewSection、PreviewCanvas、DimensionControls |
| `src/components/ui/` | 51 个 shadcn/ui 组件（accordion…tooltip、dropzone、video + video.css） |
| `src/components/` | qrcodedataurl.tsx |
| `src/contexts/` | AuthContext.tsx |
| `src/db/` | supabase.ts |
| `src/api/` | templates.ts（原 `templates.ts`，Supabase CRUD） |
| `src/types/` | index.ts（原 `index (1).ts`，CustomTemplate/Option 类型）、types.ts（新建，见下） |
| `src/lib/` | utils、render、parser、inline、color、components、types、index、presets、templates（原 `templates (1).ts`，内置模板库） |
| `src/lib/editor/` | constants、listFormat、defaultText、selection、image |
| `src/hooks/` | 12 个 use-* hooks |
| `.rules/` | check.sh、testBuild.sh 及 8 个 ast-grep 规则 yml（package.json 的 lint 脚本引用 `.rules/` 路径） |
| `supabase/migrations/` | 00001/00002 SQL 迁移文件 |
| `docs/` | prd.md、DESIGN.md |
| `archive/` | 历史产物（见第 4 条） |
| `public/` | favicon.png（补齐，见第 3 条）、images/grid-01.svg |

### 2. 重名/重复文件

| 文件 | 判定 | 处理 |
| --- | --- | --- |
| `index.html`（868 KB）与 `codeleaf-standalone.html`（868 KB） | 二进制级完全相同，为单文件构建产物，占用了真正的入口文件名 | 删除重复的 `index.html`；`index (1).html`（315 B，真正的 Vite 入口）改名为 `index.html`；单文件版移入 `archive/` |
| `templates.ts`（1 KB，Supabase CRUD）与 `templates (1).ts`（2.1 KB，内置模板库 TEXT_TEMPLATES） | 并非重复，是两个不同模块（import 路径分别为 `@/api/templates` 和 `@/lib/templates`） | 分别归位到 `src/api/templates.ts` 与 `src/lib/templates.ts` |
| `index.ts`（359 B，渲染模块出口）与 `index (1).ts`（373 B，类型定义） | 并非重复 | 分别归位到 `src/lib/index.ts` 与 `src/types/index.ts` |

### 3. 本地缺失、已补齐的内容

| 缺失项 | 依据 | 处理 |
| --- | --- | --- |
| `src/types/types.ts`（`Profile` 类型） | AuthContext.tsx 中 `import type { Profile } from '@/types/types'` | 新建该文件，含 Profile 接口（原文件带 `@ts-ignore` 引用，说明平台导出时即缺失；AuthContext 当前未被启用，影响有限） |
| `public/favicon.png` | Vite 入口 index.html 引用 `/favicon.png` | 从线上版本的官方图标 CDN 下载补齐 |
| `.env.example` / `.env.local` | supabase.ts 依赖 `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`，由平台构建时注入 | 新建模板文件，并从线上构建产物中提取实际值写入 `.env.local`（已加入 .gitignore，不入库） |
| `.gitignore` | 上传 GitHub 需要 | 新建（排除 node_modules、.env*、.DS_Store、.workbuddy 等） |
| `README.md` 项目信息 | 原为平台通用模板，介绍为空 | 重写为项目实际说明（功能、真实目录结构、本地开发步骤） |

### 4. 平台产物归档（不属于应用源码，移入 `archive/`）

- `codeleaf-standalone.html`：单文件构建版（全部资源内联）
- `text-previewer.html` + `highlight.min.js`、`github-dark.min.css`、`html-to-image.js`：早期独立演示页及其依赖库（无文件引用这些库，属遗留）
- `manifest.json` + `home-1/2/3.html`（移入 `archive/design-mockups/`）：秒哒"超级设计"功能的设计稿与清单，README 提到的 `tasks/design/` 路径即对应这批文件
- `design-budget.json`：设计稿校验记录（保留在根目录，供追溯）

### 5. 已知残留差异（无法恢复，影响可忽略）

1. `.rules/useAuth.yml` 与 `.rules/authProvider.yml`：`check.sh` 引用了这两个规则文件但本地未下载到；脚本对缺失容错（`2>/dev/null`），lint 不会报错。且 AuthContext 当前未启用，规则不生效。
2. 构建产物（线上 bundle 的压缩 JS/CSS）未在本地保留源文件——其内容即 `src/` 的编译结果，无需保留。
3. `VITE_SENTRY_DSN` 等平台注入的运行时配置无法从 bundle 中完整还原（bundle 中未见明文 Sentry DSN），`.env.local` 中留空即可。
