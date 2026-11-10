#!/usr/bin/env bash
# 一键双站发布：GitHub Pages（源码构建） + www.anliways.com/codeleaf/（Vercel 单文件产物）
#
# 用法：
#   npm run deploy            # 构建 → 推送源码 → 同步单文件 → 校验
#   npm run deploy -- --no-push   # 只构建与同步单文件，不推送源码仓库（本地预览用）
#
# 依赖：git、node、pnpm/npm 已安装且 gh 或 git 已具备推送权限。
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

SITE_REPO="${SITE_REPO:-Anliways/anliways-site}"
SITE_SUBDIR="codeleaf"
PAGES_URL="${PAGES_URL:-https://anliways.github.io/codeleaf/}"
SITE_URL="${SITE_URL:-https://www.anliways.com/codeleaf/}"
CACHE_DIR="$ROOT/.site-cache/anliways-site"

NO_PUSH=0
for arg in "$@"; do
  [ "$arg" = "--no-push" ] && NO_PUSH=1
done

say() { printf '\n\033[1;36m▸ %s\033[0m\n' "$1"; }
ok()  { printf '\033[1;32m  ✓ %s\033[0m\n' "$1"; }
warn(){ printf '\033[1;33m  ! %s\033[0m\n' "$1"; }

# ---------- 1. 常规构建（校验代码可编译，供 GitHub Pages 源码部署使用） ----------
say "1/5 常规构建（GitHub Pages 用）"
npm run build >/dev/null
ok "dist/ 构建通过"

# ---------- 2. 单文件构建（Vercel 子目录用） ----------
say "2/5 单文件构建"
npx vite build --config vite.singlefile.config.ts >/dev/null
ok "dist-singlefile/index.html 已生成（$(du -h dist-singlefile/index.html | cut -f1)）"

# ---------- 3. 推送源码仓库（触发 GitHub Pages 自动部署） ----------
say "3/5 推送源码仓库"
if [ "$NO_PUSH" = "1" ]; then
  warn "已跳过（--no-push）"
else
  if [ -n "$(git status --porcelain)" ]; then
    git add -A
    git commit -m "chore: 同步更新 $(date '+%Y-%m-%d %H:%M')" >/dev/null
    ok "已提交本地改动"
  else
    ok "工作区干净，无需提交"
  fi
  git push origin HEAD 2>&1 | tail -2
  ok "源码已推送，GitHub Pages 将自动部署"
fi

# ---------- 4. 同步单文件到 anliways-site ----------
say "4/5 同步单文件到 $SITE_REPO"
if [ -d "$CACHE_DIR/.git" ]; then
  git -C "$CACHE_DIR" fetch --depth 1 origin main >/dev/null 2>&1 || true
  git -C "$CACHE_DIR" reset --hard origin/main >/dev/null
  ok "已更新本地镜像"
else
  mkdir -p "$(dirname "$CACHE_DIR")"
  gh repo clone "$SITE_REPO" "$CACHE_DIR" -- --depth 1 >/dev/null 2>&1
  ok "已克隆 $SITE_REPO"
fi

# 生成自包含产物：本地 favicon 引用改为主站根目录图标，保持零外部依赖
node -e '
const fs = require("fs");
const src = "dist-singlefile/index.html";
const dst = process.argv[1] + "/'$SITE_SUBDIR'/index.html";
const html = fs.readFileSync(src, "utf8").replace(/href="\.\/favicon\.png"/g, "href=\"/favicon.svg\"");
fs.writeFileSync(dst, html);
if (html.includes("代码叶")) { console.error("检测到旧名称「代码叶」，请检查构建产物"); process.exit(1); }
console.log("  单文件已写入 " + dst + "（" + html.length + " 字节）");
' "$CACHE_DIR"

if [ -n "$(git -C "$CACHE_DIR" status --porcelain)" ]; then
  git -C "$CACHE_DIR" add "$SITE_SUBDIR/index.html"
  git -C "$CACHE_DIR" -c user.name="Anliways" -c user.email="anliways8@gmail.com" \
    commit -m "chore(codeleaf): 同步最新单文件构建 $(date '+%Y-%m-%d %H:%M')" >/dev/null
  git -C "$CACHE_DIR" push origin HEAD 2>&1 | tail -2
  ok "已推送，Vercel 将自动发布"
else
  ok "单文件无变化，跳过提交"
fi

# ---------- 5. 线上校验 ----------
say "5/5 线上校验（最多等待 90 秒生效）"

# GitHub Pages：HTML 只引用外链 JS，需进一步检查 bundle 内容
check_pages() {
  local url="$1" html js body
  for _ in $(seq 1 18); do
    html="$(curl -fsS --max-time 10 "$url?cb=$(date +%s)" 2>/dev/null || true)"
    js="$(printf '%s' "$html" | grep -o 'assets/index-[^"]*\.js' | head -1 || true)"
    if [ -n "$js" ]; then
      body="$(curl -fsS --max-time 20 "${url}${js}" 2>/dev/null || true)"
      case "$body" in
        *自媒体*)
          ok "GitHub Pages 已包含「自媒体」入口（${js}）"
          return 0
          ;;
      esac
    fi
    sleep 5
  done
  warn "GitHub Pages 尚未生效（部署通常需 1~2 分钟，可稍后手动确认）"
  return 0
}

# Vercel 子目录：单文件产物，正文内直接包含「自媒体」
check_single() {
  local url="$1" body
  for _ in $(seq 1 18); do
    body="$(curl -fsS --max-time 15 "$url?cb=$(date +%s)" 2>/dev/null || true)"
    case "$body" in
      *自媒体*)
        ok "www.anliways.com/codeleaf 已包含「自媒体」入口"
        return 0
        ;;
    esac
    sleep 5
  done
  warn "www.anliways.com/codeleaf 尚未生效（Vercel 构建通常需 30~60 秒）"
  return 0
}

check_pages "$PAGES_URL"
check_single "$SITE_URL"

printf '\n\033[1;32m完成。\033[0m 两个访问地址：\n  %s\n  %s\n' "$PAGES_URL" "$SITE_URL"
