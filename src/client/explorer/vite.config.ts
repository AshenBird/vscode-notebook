import { defineConfig } from "vite";
import vue from '@vitejs/plugin-vue';
import jsx from "@vitejs/plugin-vue-jsx";
import path from "path";
const getPath = (p: string) => path.resolve(__dirname, "../../../", p);
export default defineConfig({
  root: getPath(`src/client/explorer/`),
  base: "./",
  // publicDir,
  build: {
    outDir: getPath(`out/client/explorer/`),
    emptyOutDir: true,
    watch:process.env.MODE==="watch"?{}:undefined,
  },
  plugins: [vue(), jsx()],
  // @ts-ignore
  ssgOptions: {
    mock: true,
  },
  resolve: {
    // 别名
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});