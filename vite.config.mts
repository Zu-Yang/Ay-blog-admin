import path from "path";
import { defineConfig } from 'vite'
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { svgBuilder } from "./src/icons/loader";
import markdown from '@vavt/vite-plugin-import-markdown'
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    vue(),
    vueJsx(),
    markdown(), // 在 Vue 项目中直接导入和解析 Markdown 文件
    svgBuilder("./src/icons/svg/"),
    Components({
      resolvers: [
        AntDesignVueResolver({
          importStyle: false, // css in js
        }),
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  server: {
    port: 1088,
    host: "0.0.0.0",
    // proxy: {
    //   "/free": {
    //     target: "https://www.tianqiapi.com",
    //     changeOrigin: true,
    //     rewrite: path => path.replace(/^\//, "")
    //   }
    // }
  },
  build: {
    rollupOptions: {
      output: {
        // manualChunks: {
        //   "package-name": ["file-name"],
        //   "element-plus": ["element-plus"],
        // },
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
        entryFileNames: "js/[name]-[hash].js",
        chunkFileNames: "js/[name]-[hash].js",
        /**
         * 处理资源目录结构
         * @param target 
         */
        assetFileNames(target) {
          const fileName = target.name || target.names[0];

          if (fileName?.endsWith(".css")) {
            return "css/[name]-[hash].css";
          }

          const imageTypes = [".png", "jpg", "jpeg", ".webp", ".gif"];

          if (fileName && imageTypes.some(type => fileName.endsWith(type))) {
            return "image/[name]-[hash].[ext]";
          }

          return "assets/[name]-[hash].[ext]";
        }
      }
    }
  },
})
