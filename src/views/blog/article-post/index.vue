<template>
  <MdEditor
    :editorId="state.editorId"
    ref="editorRef"
    v-model="state.text"
    :toolbars="state.toolbars"
    :inputBoxWitdh="state.inputBoxWitdh"
    :footers="state.footers"
    showCodeRowNumber
    autoDetectCode
    :mdHeadingId="mdHeadingId"
    @onUploadImg="onUploadImg"
    @onSave="onSave"
    @onChange="onChange"
    @onHtmlChanged="onHtmlChanged"
  >
    <template #defToolbars>
      <Mark />
      <Emoji />
      <ExportPDF
        :modelValue="state.text"
        height="500px"
        @onSuccess="onSuccess"
        @onProgress="onProgress"
      />
    </template>
    <template #defFooters>
      <Form :html="state.html" />
      <TimeNow />
    </template>
  </MdEditor>
  <!-- <MdPreview :editorId="state.editorId" v-model="state.text" /> -->
  <!-- <MdCatalog :editorId="state.editorId" /> -->
</template>

<script setup lang="ts">
import { uploadImage } from "@/api/common";
import { ref, reactive, onMounted, nextTick, onUnmounted } from "vue";
import { MdEditor, MdCatalog, MdPreview } from "md-editor-v3";
import type { ExposeParam, Footers } from "md-editor-v3";
import { Emoji, Mark, ExportPDF } from "@vavt/v3-extension";
import { isMobile } from "@vavt/util";
import { message } from "@/utils/message";
import mdCN from "./example.md";
import { toolbars } from "./staticConfig";
import TimeNow from "@/components/TimeNow/index.vue";
import Form from "./components/Form.vue";
import { parse } from "node-html-parser";
import uslug from "uslug";

const editorRef = ref<ExposeParam>();
const state = reactive({
  html: "",
  editorId: "md-editor-v3",
  text: mdCN,
  inputBoxWitdh: "50%", // 编辑器宽度
  footers: ["markdownTotal", "=", 0, 1, "scrollSwitch"] as Footers[], // 页脚显示内容，'='左右分割，设置为[]不显示页脚。https://imzbf.github.io/md-editor-v3/zh-CN/api#%F0%9F%A6%B6%20footers
  toolbars,
});

/** 图片上传事件 */
const onUploadImg = async (
  files: Array<File>,
  callback: (urls: string[]) => void
) => {
  const res = await Promise.all(
    files.map((file) => {
      return new Promise((rev, rej) => {
        const form = new FormData();
        form.append("file", file, file.name);
        uploadImage(form)
          .then((res) => rev(res))
          .catch((error) => rej(error));
      });
    })
  );
  callback(res.map((item: any) => item.data.image));
};

/** 保存事件 */
const onSave = (v: string, h: Promise<string>) => {
  console.log(v);

  h.then((html) => {
    console.log(html);
  });
};

/** 内容变化事件 */
const onChange = (v: string) => {
  console.log(v);
};

/** 构造标题ID的生成方式。 */
const mdHeadingId = (_text: string, _level: number, index: number): string => {
  return _text;
};

/** 实时获取html内容 */
const onHtmlChanged = (html: string) => {
  Object.assign(state, { html });
  // nextTick(() => {
  //   const previewNode = document.querySelector(`#${state.editorId}-preview`);
  //   if (previewNode) {
  //     const htmlParse = nodeHtmlParser(html);
  //     previewNode.innerHTML = htmlParse; // 插入修改后的html
  //     state.html = htmlParse; // 保存新的html内容, 用于更新html代码预览
  //   }
  // });
};

/** 导出PDF进度 */
const onProgress = ({ ratio }: any) => {
  // message.info(`Progress: ${ratio * 100}%`);
};

/** 导出PDF成功 */
const onSuccess = () => {
  message.success("Export successful.");
};

/** 移动端切换布局 */
const changeLayout = () => {
  if (isMobile()) {
    // 在移动端不现实分屏预览，要么编辑，要么仅预览
    state.toolbars = [
      "previewOnly",
      ...toolbars.filter(
        (item) => !(["preview", "previewOnly"] as any).includes(item)
      ),
    ];
    state.inputBoxWitdh = "100%";
    editorRef.value?.togglePreview(false);
  } else {
    state.toolbars = toolbars;
    state.inputBoxWitdh = "50%";
    editorRef.value?.togglePreview(true);
  }
};

/**
 * 自定义标题锚点;
 * @description 注意:会影响到html代码预览 √;
 * @description 注意:会影响到编辑器自带的目录系统 x;
 */
// const nodeHtmlParser = (html: string): string => {
//   const root = parse(html);
//   // 用于存储已使用的id，防止重复
//   const usedIds = new Map<string, number>();

//   for (const h of root.querySelectorAll("h1, h2, h3, h4, h5, h6")) {
//     let baseSlug = uslug(
//       h.getAttribute("data-id") || h.getAttribute("id") || h.textContent
//     );

//     // 检查id是否已存在，如果存在则添加递增的数字后缀
//     let slug = baseSlug;
//     if (usedIds.has(baseSlug)) {
//       const count = usedIds.get(baseSlug)! + 1; // 存在则重复次数+1
//       usedIds.set(baseSlug, count);
//       slug = `${baseSlug}-${count}`;
//     } else {
//       usedIds.set(baseSlug, 0);
//     }
//     // console.log(usedIds);
//     h.setAttribute("id", slug);
//     h.innerHTML = `${h.textContent}<a href="#${slug}" class="header-anchor">¶</a>`;
//   }

//   return root.toString();
// };

onMounted(() => {
  editorRef.value?.on("previewOnly", (v) => {
    if (isMobile() && !v) {
      editorRef.value?.togglePreview(false);
    }
  });
  // editorRef.value?.on("htmlPreview", status => {
  //   if (status) {
  //     nextTick(() => {
  //       const htmlPreviewNode = document.querySelector(
  //         `#${state.editorId}-html-wrapper>.md-editor-html`
  //       );
  //       if (htmlPreviewNode instanceof HTMLElement) {
  //         htmlPreviewNode.innerText = state.html; // 因手动添加预览的锚点功能,html预览代码无法跟随dom更新需手动刷新html代码预览
  //       }
  //     });
  //   }
  // });
  changeLayout();
  window.addEventListener("resize", changeLayout);
});
onUnmounted(() => {
  window.removeEventListener("resize", changeLayout);
});
</script>

<style lang="scss">
@import "md-editor-v3/lib/style.css";
@import "@vavt/v3-extension/lib/asset/style.css";
@import "./reset.scss";
</style>
