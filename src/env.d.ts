/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.md' {
  const Component: ComponentOptions;
  export default Component;
}

declare namespace NodeJS {
  type Timeout = number // 尝试修改 setTimeout | setInterval 的返回类型为 number;
}

declare module 'uslug';
declare module 'markdown-it-mark';
declare module 'markdown-it-attrs';
declare module 'markdown-it-link-attributes';
declare module 'node-html-parser';

// declare module "timers" {
//   global {
//     // namespace NodeJS {
//     //   type Timeout = number
//     // }
//     function setTimeout(callback: (args: void) => void, ms?: number): number;
//   }
// }

// Vite 在 vite/client.d.ts 中为 import.meta.env 提供了类型定义，
interface ViteTypeOptions {
  // 添加这行代码，你就可以将 ImportMetaEnv 的类型设为严格模式，
  // 这样就不允许有未知的键值了。
  // strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
  // readonly VITE_APP_TITLE: string
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}