import Layout from "@/layout/index.vue";
import store from "@/store";
import Page404 from "@/views/page-404.vue";
import type { RouteItem } from "./types";

/**
 * 动态路由
 */
export const dynamicRouters: Array<RouteItem> = [
  {
    path: "/",
    name: "index",
    redirect: "/home",
    component: Layout,
    meta: { title: "首页", icon: "home" },
    children: [
      {
        path: "/home",
        meta: { title: "首页展示", icon: "guide" },
        component: () => import("@/views/example/home.vue")
      },
      {
        path: "/nested",
        name: "nested",
        redirect: "/nested/menu-1",
        meta: { title: "多级菜单嵌套", icon: "tree" },
        component: () => import("@/views/example/nested.vue"),
        children: [
          {
            path: "/nested/menu-1",
            name: "nested/menu-1",
            meta: { title: "菜单 2-1" },
            component: () => import("@/views/example/menu-1.vue")
          },
          {
            path: "/nested/menu-2",
            name: "nested/menu-2",
            meta: { title: "菜单 2-2" },
            component: () => import("@/views/example/menu-2.vue")
          },
          {
            path: "/nested/three-level",
            name: "nested/three-level",
            meta: { title: "三级菜单" },
            redirect: "/nested/three-level/menu-1",
            component: () => import("@/views/example/nested.vue"),
            children: [
              {
                path: "/nested/three-level/menu-1",
                name: "/nested/three-level/menu-1",
                meta: { title: "菜单 3-1" },
                component: () => import("@/views/example/menu-1.vue")
              },
              {
                path: "/nested/three-level/menu-2",
                name: "/nested/three-level/menu-2",
                meta: { title: "菜单 3-2" },
                component: () => import("@/views/example/menu-2.vue")
              },
            ]
          },
          {
            path: "/nested/four-level",
            name: "nested/four-level",
            meta: { title: "三级菜单-2" },
            redirect: "/nested/four-level/menu-1",
            component: () => import("@/views/example/nested.vue"),
            children: [
              {
                path: "/nested/four-level/menu-1",
                name: "/nested/four-level/menu-1",
                meta: { title: "菜单 3-2-1" },
                component: () => import("@/views/example/menu-1.vue")
              },
              {
                path: "/nested/four-level/menu-2",
                name: "/nested/four-level/menu-2",
                meta: { title: "菜单 3-2-2" },
                component: () => import("@/views/example/menu-2.vue")
              },
            ]
          },
          {
            path: "/nested/menu-3",
            name: "nested/menu-3",
            meta: { title: "菜单 2-3" },
            component: () => import("@/views/example/menu-3.vue")
          }
        ]
      },
      // {
      //   path: "/link-baidu",
      //   name: "link-baidu",
      //   component: Page404, // 这里必需给一个组件
      //   meta: {
      //     title: "百度一下",
      //     icon: "baidu",
      //     link: "https://www.baidu.com"
      //   },
      // },
      // {
      //   path: "/menu-4",
      //   name: "menu-4",
      //   meta: { title: "换行菜单标题换行菜单标题", icon: "nested" },
      //   component: () => import("@/views/example/menu-4.vue")
      // }
    ]
  },
  {
    path: "/blog",
    name: "blog",
    redirect: "/blog/article-manage",
    component: Layout,
    meta: { title: "A'yang Blog", icon: "blog", auth: [0] },
    children: [
      // {
      //   path: "/blog/article-post",
      //   name: "article-post",
      //   meta: { title: "发博文", icon: "post" },
      //   component: () => import("@/views/blog/article-post/index.vue")
      // },
      {
        path: "/blog/article-manage",
        name: "article-manage",
        meta: { title: "博文管理", icon: "list" },
        component: () => import("@/views/blog/article-manage/index.vue")
      },
    ]
  },
  {
    path: "/example",
    name: "example",
    component: Layout,
    meta: { title: "示例页栏目", icon: "menu" },
    redirect: "/example/request",
    children: [
      {
        path: "/example/request",
        name: "example-request",
        meta: { title: "http-请求示例", keepAlive: true },
        component: () => import("@/views/example/request.vue"),
      },
      {
        path: "/example/components",
        name: "example-components",
        meta: { title: "自定义组件" },
        component: () => import("@/views/example/the-components.vue")
      },
      {
        path: "/example/tsx",
        name: "example-tsx",
        meta: { title: "tsx-示例" },
        component: () => import("@/views/tsx/example")
      },
      {
        path: "/example/no-found",
        name: "no-found",
        meta: {
          title: "404 页面",
          link: `${location.origin + location.pathname}#/is-error-path`,
        },
        component: Page404
      }
    ]
  },
  {
    path: "/icon",
    name: "icon",
    meta: { title: "图标栏目", auth: [0], },
    component: Layout,
    redirect: "/icon/svg-icons",
    children: [
      {
        path: "/icon/svg-icons",
        name: "svg-icons",
        component: () => import(/* webpackChunkName: "icons" */ "@/views/svg-icons/index.vue"),
        meta: { title: "svg-图标", icon: "svg-icon" }
      }
    ]
  },
  {
    path: "/" + "http://localhost:8080/page/1",
    name: "A'yang",
    component: Page404, // 这里必需给一个组件
    meta: {
      title: "博客地址",
      icon: "link",
      link: "http://localhost:8080/page/1",
      auth: [0],
    }
  },
  {
    path: "/" + store.projectInfo.link,
    name: "GitHub-Travis",
    component: Page404, // 这里必需给一个组件
    meta: {
      title: "项目地址",
      icon: "github",
      link: store.projectInfo.link,
      auth: [0],
    }
  }
];
