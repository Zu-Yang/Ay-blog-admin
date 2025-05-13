import { createRouter, createWebHistory, createWebHashHistory } from "vue-router";
import { initPermission } from "./permission";
import Page404 from "@/views/page-404.vue";
import type { RouteItem } from "./types";

/**
 * 基础路由
 * @description 
 * - `vue-router 4.x`之后路由路径匹配规则改了，不再是智能匹配，所以在定义路由的时候必须要在前面加上`/`
 * - 重定向`redirect`也要加"/"
 * - 子路由`children`里面的路由也是需要基于父级来定义，从下面代码观察一下就会发现规律了
 */
const base: Array<RouteItem> = [
  {
    path: "/login",
    name: "login",
    component: () => import("../views/login.vue"),
    meta: { hidden: true, title: "请登录" },
  }, {
    path: "/404",
    name: "page-404",
    component: Page404,
    meta: { hidden: true, title: "不存在该页面" },
  }, {
    path: "/401",
    name: "page-401",
    component: () => import("../views/page-401.vue"),
    meta: { hidden: true, title: "暂无权限访问" },
  }
];

/**
 * 路由实例 
 * [文档地址](https://next.router.vuejs.org/introduction.html)
 * @description  history: createWebHistory(base?) 基准路径，它被预置到每个 URL 上。这允许在一个域名子文件夹中托管 SPA，例如将 base 设置为 /sub-folder 使得其托管在 example.com/sub-folder。
 * @description  history: createWebHashHistory(base?) 基准路径，它被预置到每个 URL 上。这允许在一个域名子文件夹中托管 SPA，例如将 base 设置为 /sub-folder 使得其托管在 example.com/sub-folder。
*/
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // Memory 模式：createWebHistory
  // history: createWebHashHistory(import.meta.env.BASE_URL), // Hash模式：createWebHashHistory
  routes: base,
});

initPermission(router, base);

export default router;