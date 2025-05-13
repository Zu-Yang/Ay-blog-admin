import { createApp } from "vue";
import App from "./App.vue";
import SvgIcon from "./icons";
import BaseDialog from "./components/base-dialog";
import router from "./router";
import { version } from "../package.json";
import { copyDirective, rippleDirective } from "./utils/directive";
import "./utils/markdown";
import './styles/tailwind.css';
import "./styles/index.scss";
import "./styles/layout.scss";

window.version = version;

const app = createApp(App);

// `v-copy` 点击复制内容
app.directive('copy', copyDirective);
// `v-ripple` 点击添加水波纹效果
app.directive("ripple", rippleDirective)


// 注册全局组件: `svg-icon`
app.component("svg-icon", SvgIcon);
// 注册全局组件: 基础弹框
app.component("base-dialog", BaseDialog);

app.use(router);

app.mount("#app");

