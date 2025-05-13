<template>
  <div class="md-editor-footer-item">
    <button @click="handleClick">去发布</button>

    <MdModal :title="state.title" :visible="state.visible" :width="state.width" :showMask="state.showMask"
      @onClose="onClose">
      <div class="md-editor-form-item flex items-center">
        <label class="md-editor-label">文章标题</label>
        <input class="md-editor-input flex-1" type="text" placeholder="请输入标题..." v-model.trim="formData.title" />
      </div>
      <div class="md-editor-form-item flex items-center">
        <label class="md-editor-label">文章摘要</label>
        <textarea ref="textareaNode" class="md-editor-input flex-1" type="text" placeholder="请输入标题..."
          v-model="formData.summary" />
      </div>
      <div class="md-editor-form-item flex items-center">
        <label class="md-editor-label">是否置顶</label>
        <select class="md-editor-input flex-1" name="top" id="top" v-model="formData.top">
          <option :value="top.value" v-for="top in formOption.topList" :key="top.value">{{ top.label }}</option>
        </select>
      </div>
      <div class="md-editor-form-item flex items-center">
        <label class="md-editor-label">文章标签</label>
        <select class="md-editor-input flex-1" name="tag" id="tag" v-model="formData.tagId">
          <option :value="tag.value" v-for="tag in formOption.tagList" :key="tag.value">{{ tag.label }}
          </option>
        </select>
      </div>
      <div class="md-editor-form-item flex items-center">
        <label class="md-editor-label">文章分类</label>
        <select class="md-editor-input flex-1" name="category" id="category" v-model="formData.categoryId">
          <option :value="cate.value" v-for="cate in formOption.categoryList" :key="cate.value">{{ cate.label }}
          </option>
        </select>
      </div>
      <div class="md-editor-form-item flex items-center">
        <label class="md-editor-label">封面图</label>
        <UploadImage class="flex-1" uploadId="banner" :src="formData.banner" tip="请上传文章封面图" @change="onUpload"
          @remove="remove" />
      </div>
      <div class="md-editor-form-item flex items-center">
        <img src="" alt="" />
      </div>
      <div class="md-editor-form-item">
        <button class="md-editor-btn" type="button" :disabled="loading" @click="submit">{{ loading ? "正在发布..." : "发布"
          }}</button>
      </div>
    </MdModal>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watchEffect, onMounted, nextTick } from "vue";
import { MdModal } from "md-editor-v3";
import { UploadImage, type UploadChange } from "@/components/Upload";
import { type Message, message, messageBox } from "@/utils/message";
import { deleteImage, addArticles, getCategory } from "@/api/common";

const props = defineProps({
  html: {
    type: String,
    default: ""
  }
});

const textareaNode = ref();
const loading = ref(false);

const state = reactive({
  width: "500px",
  height: "auto",
  title: "文章配置",
  visible: false,
  showMask: true,
  showAdjust: true, // 是否显示全屏按钮
});

const formData = reactive({
  html: "",
  title: "markdown",
  summary: "markdown", // 文章摘要
  banner: "http://10.4.32.45:9000/article-images/64947208-20250506184441.jpg",
  top: '', // 0:非置顶, 1:置顶
  tagId: 1,
  categoryId: 1, // 不能是数字否则规则验证会出错
  // isOriginal: 0, // 0:原创, 1:转载
  // isComment: 0, // 0:允许评论, 1:不允许评论
});

const formOption = reactive({
  topList: [
    { label: '是否置顶', value: '' },
    { label: '置顶', value: 1 },
    { label: '非置顶', value: 0 },
  ],
  tagList: [
    { label: '请选择标签', value: '' },
    { label: '标签1', value: 1 },
    { label: '标签2', value: 2 },
    { label: '标签3', value: 3 }
  ],
  categoryList: [
    { label: '请选择分类', value: '' },
    { label: '分类1', value: 1 },
    { label: '分类2', value: 2 },
    { label: '分类3', value: 3 },
  ],
});

/**
 * 监听html变化
 */
watchEffect(() => {
  formData.html = props.html;
})

/**
 * 发布文章
 */
const submit = async () => {
  const { title, summary, banner, html, top, tagId, categoryId } = formData;
  // 校验参数
  if (!html) {
    message.error("请编辑文章内容");
    return;
  } else if (!title) {
    message.error("请输入文章标题");
    return;
  } else if (!summary) {
    message.error("请输入文章摘要");
    return;
  } else if (top === '') {
    message.error("请选择是否置顶");
    return;
  } else if (!tagId) {
    message.error("请选择标签");
    return;
  } else if (!categoryId) {
    message.error("请选择文章分类");
    return;
  } else if (!banner) {
    message.error("请上传文章封面图");
    return;
  }

  loading.value = true;

  const params = {
    tag_id: tagId,
    category_id: categoryId,
    article_top: top,
    article_title: title,
    article_summary: summary,
    article_cover: [banner],
    article_content: html,
  };
  // console.log(params);
  // return;
  const res = await addArticles(params);
  if (res.code === 200) {
    message.success("发布成功");
    state.visible = false;
  } else {
    message.error(res.msg);
  }
  loading.value = false;
}

/**
 * 监听上传图片
 * @param info 回调数据
 */
const onUpload = async (info: UploadChange<"banner" | "logo">) => {
  // info.id 就是组件绑定的 uploadId，多个上传组件的时候用来区分用，可传可不传
  console.log(info);
  formData.banner = info.src;
}

/**
 * 删除图片
 * @param uploadId 上传组件`id`
 */
const remove = async (uploadId: string | number) => {
  const res = await deleteImage(new Array(formData.banner));
  if (res.code === 200) {
    formData.banner = "";
    message.success("删除成功");
  } else {
    message.error(res.msg);
  }
}

/**
 * 关闭模态框
 */
const onClose = () => {
  state.visible = false;
};

/**
 * 打开模态框
 */
const handleClick = () => {
  state.visible = !state.visible;
};

/**
 * textarea自适应高度
 */
const resizeTextarea = () => {
  return watchEffect(() => {
    const textarea = textareaNode.value;
    if (!textarea) return;
    const handler = (e: Event) => {
      const maxH = 100;
      const tar = e.target as HTMLTextAreaElement;
      tar.style.height = "auto";
      tar.style.maxHeight = `${maxH}px`;
      tar.style.height = `${tar.scrollHeight}px`;
      tar.style.overflowY = tar.scrollHeight > maxH ? "auto" : "hidden";
    };
    textarea.addEventListener("input", handler);
    // 清理函数：组件卸载时移除监听
    return () => {
      textarea.removeEventListener("input", handler);
    };
  });
};

onMounted(() => {
  nextTick(() => {
    resizeTextarea();
  });
});
</script>


<style lang="scss">
.the-upload-content {
  width: 100% !important;
}
</style>