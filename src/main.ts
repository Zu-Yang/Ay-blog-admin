import { createApp } from "vue";
import App from "./App.vue";
import SvgIcon from "./icons";
import BaseDialog from "./components/base-dialog";
import router from "./router";
import { createPinia } from 'pinia'
import { version } from "../package.json";
import { copyDirective, rippleDirective } from "./utils/directive";
import VueLazyload from 'vue-lazyload'
import { LazyImg, Waterfall } from 'vue-waterfall-plugin-next'
import 'vue-waterfall-plugin-next/dist/style.css'
import 'animate.css';


import "./utils/markdown";
import './styles/tailwind.css';
import "./styles/index.scss";
import "./styles/layout.scss";
import "md-editor-v3/lib/style.css";
import "@vavt/v3-extension/lib/asset/style.css";

window.version = version;

const app = createApp(App);

// `v-copy` 点击复制内容
app.directive('copy', copyDirective);
// `v-ripple` 点击添加水波纹效果
app.directive("ripple", rippleDirective)

// `vue-lazyload` 图片懒加载
// https://www.npmjs.com/package/vue-lazyload
app.use(VueLazyload, {
  // preLoad: 1.3,
  // error: errorimage,
  // loading: loadimage,
  // attempt: 1
})

// 注册全局组件: `svg-icon`
app.component("svg-icon", SvgIcon);
// 注册全局组件: 基础弹框
app.component("base-dialog", BaseDialog);
app.component("Waterfall", Waterfall);
app.component("LazyImg", LazyImg);

app.use(router);
app.use(createPinia())

app.mount("#app");

