<template>
  <div class="md-editor-footer-item">
    <button @click="handleClick">去发布</button>
    <MdModal :title="state.title" :visible="state.visible" :width="state.width" :showMask="state.showMask"
      @onClose="onClose">
      <div class="md-editor-form-item flex items-center">
        <label class="md-editor-label">文章标题</label>
        <input class="md-editor-input flex-1" :disabled="isSave" type="text" placeholder="请输入标题..."
          v-model.trim="formData.title" />
      </div>
      <div class="md-editor-form-item flex items-center">
        <label class="md-editor-label">文章摘要</label>
        <textarea ref="textareaNode" class="md-editor-input flex-1" :disabled="isSave" type="text"
          placeholder="请输入标题..." v-model="formData.summary" />
      </div>
      <div class="md-editor-form-item flex items-center">
        <label class="md-editor-label">是否置顶</label>
        <select class="md-editor-input flex-1" :disabled="isSave" name="top" id="top" v-model="formData.top">
          <option :value="top.value" v-for="top in formOption.topList" :key="top.value">
            {{ top.label }}
          </option>
        </select>
      </div>
      <div class="md-editor-form-item flex items-center">
        <label class="md-editor-label">文章标签</label>
        <select class="md-editor-input flex-1" :disabled="isSave" name="tag" id="tag" v-model="formData.tagId">
          <option v-for="tag in formOption.tagList" :key="tag.value" :value="tag.value">
            {{ tag.value ? tag.label : "请选择标签" }}
          </option>
        </select>
      </div>
      <div class="md-editor-form-item flex items-center">
        <label class="md-editor-label">文章分类</label>
        <select class="md-editor-input flex-1" :disabled="isSave" name="category" id="category"
          v-model="formData.cateId">
          <option v-for="cate in formOption.categoryList" :key="cate.value" :value="cate.value">
            {{ cate.value ? cate.label : "请选择分类" }}
          </option>
        </select>
      </div>
      <div class="md-editor-form-item flex items-center">
        <label class="md-editor-label">封面图</label>
        <UploadImage class="flex-1" :disabled="isSave" uploadId="cover" src="" tip="请上传文章封面图（可上传多张）"
          @change="onUpload" />
      </div>
      <div class="md-editor-form-item flex items-center">
        <!-- <label class="md-editor-label">封面图</label> -->
        <UploadImage class="flex-1" :disabled="isSave" v-for="item in formData.cover" :key="item" uploadId="cover"
          :src="item" @remove="remove(item)" />
      </div>
      <div class="md-editor-form-item flex items-center">
        <img src="" alt="" />
      </div>
      <div class="md-editor-form-item">
        <button class="md-editor-btn" :disabled="isSave || !isModify" type="button" @click="submitEdit">
          {{ isSave ? "正在保存编辑..." : "保存编辑" }}
        </button>
      </div>
    </MdModal>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watchEffect, onMounted, nextTick, watch } from "vue";
import { MdModal } from "md-editor-v3";
import { UploadImage, type UploadChange } from "@/components/Upload";
import { type Message, message, messageBox } from "@/utils/message";
import { deleteImage, updateArticle, addArticles, getCate } from "@/api/blog";
import type { UpdateBlog } from "@/api/blogType";
import { useArticle } from "@/store/Article";

const store = useArticle()

const props = defineProps({
  html: {
    type: String,
    default: "",
  },
  content: {
    type: String,
    default: "",
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
        top: 0,
        cover: [],
        cateInfo: [],
        tagInfo: [],
      };
    },
  },
});

const textareaNode = ref(); // 文章内容textarea节点
const isSave = ref(false); // 是否正在保存编辑
const isModify = ref(false); // 是否已经修改

const state = reactive({
  width: "500px", // 模态框宽度
  height: "auto", // 模态框高度
  title: "文章配置", // 模态框标题
  visible: false, // 模态框是否显示
  showMask: true, // 模态框是否显示遮罩
  showAdjust: true, // 是否显示全屏按钮
});

const formData = reactive<UpdateBlog>({
  id: props.data.id, // 文章ID
  title: props.data.title, // 文章标题
  content: props.content, // 文章内容
  html: props.html, // 文章HTML
  summary: props.data.summary, // 文章摘要
  cover: props.data.cover, // 封面图
  top: props.data.top, // 0:非置顶, 1:置顶
  tagId: props.data.tagId, // 标签id
  cateId: props.data.cateId, // 分类id
});

const formOption = reactive({
  topList: [
    { label: "请选择是否置顶", value: "" },
    { label: "置顶", value: "1" },
    { label: "非置顶", value: "0" },
  ],
  tagList: [
    { label: "请选择标签", value: "" },
  ],
  categoryList: [
    { label: "请选择分类", value: "" },
  ],
});
props.data.tagInfo.forEach((item: any) => {
  formOption.tagList.push({ label: item.text, value: item.value.toString() });
});
props.data.cateInfo.forEach((item: any) => {
  formOption.categoryList.push({ label: item.text, value: item.value.toString() });
});

/**
 * 监听文章内容变化
 */
watchEffect(() => {
  formData.html = props.html;
  formData.content = props.content;
});

/**
 * 监听用户是否修改操作
 */
watch(() => [props.content, formData.title, formData.summary, formData.top, formData.tagId, formData.cateId, formData.cover], (newVal) => {
  if (formData.top === "" || formData.tagId === "" || formData.cateId === "") {
    isModify.value = false
  }
  else {
    isModify.value = true
  }
}, { deep: true });

/**
 * 重置数据
 */
const reset = () => {
  state.visible = false;
  Object.assign(formData, {
    id: null,
    title: "",
    summary: "",
    content: "",
    html: "",
    cateId: "",
    tagId: "",
    top: 0,
    cover: [],
  });
  Object.assign(formOption, {
    tagList: [
      { label: "请选择标签", value: "" },
    ],
    categoryList: [
      { label: "请选择分类", value: "" },
    ]
  });
  store.$patch({ showEdit: false })
}

/**
 * 保存编辑
 */
const submitEdit = async () => {
  const { id, title, summary, cover, content, html, top, tagId, cateId } = formData;
  // 校验参数
  if (!id) {
    message.error("无法获取文章ID");
    return;
  } else if (!content) {
    message.error("请编辑文章内容");
    return;
  } else if (!title) {
    message.error("请输入文章标题");
    return;
  } else if (!summary) {
    message.error("请输入文章摘要");
    return;
  } else if (top === "") {
    message.error("请选择是否置顶");
    return;
  } else if (tagId === "") {
    message.error("请选择标签");
    return;
  } else if (cateId === "") {
    message.error("请选择文章分类");
    return;
  } else if (!cover) {
    message.error("请上传文章封面图");
    return;
  }

  isSave.value = true;

  const params = {
    article_id: formData.id,
    tag_id: Number(tagId),
    category_id: Number(cateId),
    article_top: Number(top),
    article_title: title.trim(),
    article_summary: summary.trim(),
    article_content: content.trim(),
    article_html: html.trim(),
    article_cover: cover,
  };
  // console.log(params);
  // return;
  const res = await updateArticle(params);
  if (res.code === 200) {
    setTimeout(() => {
      message.success("发布成功");
      store.$patch({
        // 属性与TableDataType一致
        modifiedData: {
          id: res.data.article_id,
          title: res.data.article_title,
          summary: res.data.article_summary,
          content: res.data.article_content,
          html: res.data.article_html,
          top: res.data.article_top,
          // like: res.data.article_like_count,
          // read: res.data.article_read_count,
          // comment: res.data.article_comment_count,
          // createTime: res.data.article_create_time,
          updateTime: res.data.article_update_time,
          cate: res.data.category.category_name,
          cateId: res.data.category.category_id,
          tag: res.data.tag.tag_name,
          tagId: res.data.tag.tag_id,
          cover: res.data.article_cover,
        }
      })
      reset()
    }, 600);
  } else {
    message.error(res.msg);
  }
  isSave.value = false;
};

/**
 * 监听上传图片
 * @param info 回调数据
 */
const onUpload = async (info: UploadChange) => {
  // info.id 就是组件绑定的 uploadId，多个上传组件的时候用来区分用，可传可不传
  // console.log(info);
  formData.cover.push(info.src);
};

/**
 * 删除图片
 * @param url 图片地址
 */
const remove = async (url: string) => {
  const res = await deleteImage(new Array(url));
  if (res.code === 200) {
    // 从封面数组中删除该图片
    const index = formData.cover.findIndex((item: string) => item === url);
    if (index !== -1) formData.cover.splice(index, 1);
    message.success("删除成功");
  } else {
    if (res.msg === "Not Found") {
      // 删除有误的图片
      const index = formData.cover.findIndex((item: string) => item === url);
      if (index !== -1) formData.cover.splice(index, 1);
      message.error(res.msg);
    }
  }
};

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

.md-editor-input:disabled,
.md-editor-btn:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.7;
}
</style>
