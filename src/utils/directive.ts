import ripple from "@/utils/ripple";
import { message } from "@/utils/message";
import { copyText, isMobile } from "@/utils";

// 添加一个自定义指令`v-copy`点击复制内容
export const copyDirective = {
  mounted(el: HTMLElement, binding: any) {
    el.addEventListener("click", function () {
      copyText(binding.value, () => message.success("复制成功"), tip => message.success(tip));
    });
  }
}

export const rippleDirective = {
  mounted(el: HTMLElement) {
    /** 添加事件类型 */
    const eventType = isMobile() ? "touchstart" : "mousedown";
    el.setAttribute("ripple", "");
    el.addEventListener(eventType, function (e) {
      ripple(e, el);
    });
  }
}
