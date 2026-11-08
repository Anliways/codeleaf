# 编码叶 Codeleaf

一个实时文本编辑与预览工具：左侧编辑区支持富文本输入（加粗、颜色、字号、对齐、上下标、表格、代码块、图片等），右侧预览区实时同步渲染，支持拖拽调节分割面板、设备尺寸预设、像素级精细控制和预设管理，并可导出 PNG 长图 / Markdown / TXT。

线上版本：https://app-dztld1gj05q9.appmiaoda.com/ （原托管于秒哒平台，本仓库为源码备份）

## 目录结构

```
├── README.md              # 说明文档
├── index.html             # Vite 入口文件
├── package.json           # 依赖与脚本
├── vite.config.ts         # Vite 配置（@ 别名指向 src/）
├── vite.singlefile.config.ts  # 单文件构建配置
├── tailwind.config.js     # Tailwind 配置
├── postcss.config.js      # PostCSS 配置
├── tsconfig*.json         # TypeScript 配置（app / node / check）
├── biome.json             # Biome 代码检查配置
├── components.json        # shadcn/ui 组件库配置
├── pnpm-workspace.yaml    # 工作区配置
├── sgconfig.yml           # ast-grep 配置
├── .env.example           # 环境变量模板（复制为 .env.local 使用）
├── .rules/                # 平台代码检查规则（ast-grep 规则与脚本）
├── public/                # 静态资源（favicon、图片）
├── supabase/migrations/   # 数据库迁移 SQL（custom_templates 表、存储桶）
├── docs/                  # 产品文档（PRD、设计说明、线上对比差异清单）
├── archive/               # 历史产物（单文件构建版、设计稿 HTML、离线库）
└── src/                   # 源码目录
    ├── main.tsx           # 应用入口
    ├── App.tsx            # 根组件（路由挂载）
    ├── routes.tsx         # 路由配置
    ├── index.css          # 全局样式（Tailwind 入口）
    ├── api/               # 后端接口（自定义模板 CRUD）
    ├── components/
    │   ├── common/        # 通用组件（PageMeta、MobileGate 等）
    │   ├── editor/        # 编辑区组件（含 toolbar/ 工具栏子组件）
    │   ├── preview/       # 预览区组件
    │   └── ui/            # shadcn/ui 基础组件
    ├── contexts/          # React Context（认证）
    ├── db/                # Supabase 客户端
    ├── hooks/             # 自定义 Hooks（撤销重做、图片上传、查找替换等）
    ├── lib/               # 工具库（渲染引擎 parser/render、预设、模板）
    │   └── editor/        # 编辑器常量、默认文本、选区、图片压缩
    ├── pages/             # 页面（TextPreviewer 主页面）
    └── types/             # 类型定义
```

## 技术栈

Vite · TypeScript · React 18 · Tailwind CSS · shadcn/ui · Supabase · react-resizable-panels · react-router

## 本地开发

```bash
# 环境要求：Node.js ≥ 20，npm ≥ 10

npm i                 # 安装依赖
cp .env.example .env.local   # 配置环境变量（Supabase 地址与密钥）
npm run lint          # 类型检查 + Biome lint + ast-grep 规则检查 + 构建校验
```

> 注：本仓库源自秒哒平台导出，`package.json` 中的 dev/build 脚本为平台占位（提示使用 lint 检查）。如需本地启动开发服务器，可自行添加标准 Vite 脚本（`vite` / `vite build`）。

## 相关文档

- 产品需求文档：[docs/prd.md](docs/prd.md)
- 设计说明：[docs/DESIGN.md](docs/DESIGN.md)
- 线上版本对比差异清单：[docs/DIFF-REPORT.md](docs/DIFF-REPORT.md)
