<template>
  <MdEditor
    ref="editorRef"
    v-model="state.content"
    showCodeRowNumber
    autoDetectCode
    :editorId="state.editorId"
    :toolbars="state.toolbars"
    :inputBoxWitdh="state.inputBoxWitdh"
    :footers="state.footers"
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
        :modelValue="state.content"
        height="500px"
        @onSuccess="onSuccess"
        @onProgress="onProgress"
      />
    </template>
    <template #defFooters>
      <Form :data="props.data" :html="state.html" :content="state.content" />
      <TimeNow />
    </template>
  </MdEditor>
  <!-- <MdPreview :editorId="state.editorId" v-model="state.text" /> -->
  <!-- <MdCatalog :editorId="state.editorId" /> -->
</template>
<script lang="ts">
/** markdown编辑器 */
export default {
  name: "MarkdownEditor",
};
</script>

<script setup lang="ts">
import { uploadImage } from "@/api/blog";
import { ref, reactive, onMounted, nextTick, onUnmounted } from "vue";
import type { PropType } from "vue";
import { MdEditor, MdCatalog, MdPreview } from "md-editor-v3";
import type { ExposeParam, Footers } from "md-editor-v3";
import { Emoji, Mark, ExportPDF } from "@vavt/v3-extension";
import { isMobile } from "@vavt/util";
import { message } from "@/utils/message";
// import mdCN from "./example.md";
import { toolbars } from "./staticConfig";
import TimeNow from "@/components/TimeNow/index.vue";
import Form from "./components/Form.vue";

const props = defineProps({
  editorId: {
    type: String,
    default: "md-editor-v3",
  },
  data: {
    type: Object,
    default: () => {
      return {
        id: null,
        title: "",
        summary: "",
        content: "",
        cateId: "",
        tagId: "",
        top: "",
        cover: [],
        cateInfo: [],
        tagInfo: [],
      };
    },
  },
});

/** 编辑器实例 */
const editorRef = ref<ExposeParam>();
/** 编辑器相关配置 */
const state = reactive({
  html: "",
  inputBoxWitdh: "50%",
  editorId: props.editorId,
  content: props.data.content,
  footers: ["markdownTotal", "=", 0, 1, "scrollSwitch"] as Footers[],
  toolbars,
});

/** 图片上传事件 */
const onUploadImg = async (files: Array<File>, callback: (urls: string[]) => void) => {
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
  // console.log(v);
  // h.then((html) => {
  //   console.log(html);
  // });
};

/** 内容变化事件 */
const onChange = (v: string) => {
  // console.log("onChange", v);
};

/** 构造标题ID的生成方式。 */
const mdHeadingId = (_text: string, _level: number, index: number): string => {
  return _text;
};

/** 实时获取html内容 */
const onHtmlChanged = (html: string) => {
  Object.assign(state, { html });
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
      ...toolbars.filter((item) => !(["preview", "previewOnly"] as any).includes(item)),
    ];
    state.inputBoxWitdh = "100%";
    editorRef.value?.togglePreview(false);
  } else {
    state.toolbars = toolbars;
    state.inputBoxWitdh = "50%";
    editorRef.value?.togglePreview(true);
  }
};

onMounted(() => {
  editorRef.value?.on("previewOnly", (v) => {
    if (isMobile() && !v) {
      editorRef.value?.togglePreview(false);
    }
  });
  changeLayout();
  window.addEventListener("resize", changeLayout);
});
onUnmounted(() => {
  window.removeEventListener("resize", changeLayout);
});
</script>

<style lang="scss">
@import "@/styles/md-editor.min";
</style>
