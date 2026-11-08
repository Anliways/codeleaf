// 单文件交付构建：全部 JS/CSS 内联进单个 HTML，浏览器直接打开即可独立运行
// 用法：npx vite build --config vite.singlefile.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import path from "path";

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist-singlefile",
    emptyOutDir: true,
    assetsInlineLimit: 1024 * 1024 * 20,
    chunkSizeWarningLimit: 1024 * 1024 * 20,
    cssCodeSplit: false,
  },
});
