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
        <textarea ref="textareaNode" class="md-editor-input flex-1" :disabled="isSave" placeholder="请输入摘要..."
          v-model="formData.summary" />
      </div>

      <div class="md-editor-form-item flex items-center">
        <label class="md-editor-label">是否置顶</label>
        <select class="md-editor-input flex-1" :disabled="isSave" v-model="formData.top">
          <option v-for="top in formOption.topList" :key="top.value" :value="top.value">
            {{ top.label }}
          </option>
        </select>
      </div>

      <div class="md-editor-form-item flex items-center">
        <label class="md-editor-label">文章标签</label>
        <select class="md-editor-input flex-1" :disabled="isSave" v-model="formData.tagId">
          <option v-for="tag in formOption.tagList" :key="tag.value" :value="tag.value">
            {{ tag.label }}
          </option>
        </select>
      </div>

      <div class="md-editor-form-item flex items-center">
        <label class="md-editor-label">文章分类</label>
        <select class="md-editor-input flex-1" :disabled="isSave" v-model="formData.cateId">
          <option v-for="cate in formOption.categoryList" :key="cate.value" :value="cate.value">
            {{ cate.label }}
          </option>
        </select>
      </div>
      <div class="md-editor-form-item flex items-center">
        <label class="md-editor-label">封面图</label>
        <a-upload v-model:file-list="fileList" accept=".png, .jpg, .jpeg, .webp" :progress="progress" :max-count="3"
          list-type="picture-card" :before-upload="beforeUpload" @remove="handleRemove" @preview="handlePreview">
          <div v-if="fileList.length < 3">
            <plus-outlined />
            <div style="margin-top: 8px">Upload</div>
          </div>
        </a-upload>
      </div>

      <div class="md-editor-form-item">
        <button v-if="store.modalType === 'create'" class="md-editor-btn" :disabled="isSave || !isFormValid"
          type="button" @click="submitAdd">
          {{ isSave ? "正在发布..." : "点击发布" }}
        </button>
        <button v-if="store.modalType === 'edit'" class="md-editor-btn" :disabled="isSave || !isFormValid" type="button"
          @click="submitEdit">
          {{ isSave ? "正在保存..." : "点击保存" }}
        </button>
      </div>
    </MdModal>

    <a-modal width="100%" :zIndex="30000" :open="previewVisible" :title="previewTitle" :footer="null"
      @cancel="handleCancel">
      <img style="width: 100%" :src="previewImage" />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watchEffect, onMounted, nextTick, computed } from "vue";
import { MdModal } from "md-editor-v3";
import { type Message, message, messageBox } from "@/utils/message";
import { deleteImage, uploadImage, updateArticle, addArticles, getCate } from "@/api/blog";
import type { UpdateBlog } from "@/api/blogType";
import { useArticle } from "@/store/Article";
import { Upload } from 'ant-design-vue';
import type { UploadProps } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import { getBase64 } from '@/utils/index';
import { useEncodeEmoji } from '@/utils/comment';

const store = useArticle();

interface Props {
  html?: string;
  content?: string;
  data?: {
    id?: string;
    title?: string;
    summary?: string;
    content?: string;
    cateId?: string;
    tagId?: string;
    top?: string;
    cover?: string;
    cateInfo?: Array<{ text: string; value: number }>;
    tagInfo?: Array<{ text: string; value: number }>;
  };
}

const props = withDefaults(defineProps<Props>(), {
  html: "",
  content: "",
  data: () => ({
    id: "",
    title: "",
    summary: "",
    content: "",
    cateId: "",
    tagId: "",
    top: "",
    cover: "",
    cateInfo: [],
    tagInfo: [],
  }),
});

// 响应式数据
const textareaNode = ref<HTMLTextAreaElement>();
const isSave = ref(false);
const previewVisible = ref(false);
const previewImage = ref('');
const previewTitle = ref('');
const fileList = ref<any[]>([]);

const state = reactive({
  width: "500px",
  height: "auto",
  title: "文章配置",
  visible: false,
  showMask: true,
  showAdjust: true,
});

const formData = reactive<UpdateBlog>({
  id: props.data.id ? Number(props.data.id) : 0,
  title: props.data.title || "",
  content: props.content || "",
  html: props.html || "",
  summary: props.data.summary || "",
  cover: props.data.cover || "",
  top: props.data.top || "0",
  tagId: props.data.tagId || "",
  cateId: props.data.cateId || "",
});

const formOption = reactive({
  topList: [
    { label: "请选择是否置顶", value: "" },
    { label: "置顶", value: "1" },
    { label: "非置顶", value: "0" },
  ],
  tagList: [{ label: "请选择标签", value: "" }],
  categoryList: [{ label: "请选择分类", value: "" }],
});

// 计算属性
const isFormValid = computed(() => {
  return formData.title.trim() &&
    formData.summary.trim() &&
    formData.top !== "" &&
    formData.tagId !== "" &&
    formData.cateId !== "" &&
    formData.content.trim();
});

// 上传配置
const progress: UploadProps['progress'] = {
  strokeColor: {
    '0%': '#108ee9',
    '100%': '#87d068',
  },
  strokeWidth: 3,
  format: (percent?: number) => percent ? `${parseFloat(percent.toFixed(2))}%` : '0%',
  class: 'progress',
};

// 初始化数据
const initializeFormOptions = () => {
  props.data.tagInfo?.forEach((item) => {
    formOption.tagList.push({ label: item.text, value: item.value.toString() });
  });

  props.data.cateInfo?.forEach((item) => {
    formOption.categoryList.push({ label: item.text, value: item.value.toString() });
  });
};

const initializeFileList = () => {
  try {
    const cover = props.data.cover;
    if (!cover) return;

    const coverArr = typeof cover === 'string' ? JSON.parse(cover) : cover;
    if (!Array.isArray(coverArr) || !coverArr.length) return;
    fileList.value = coverArr.map((url: string, index: number) => ({
      uid: `vc-done-${index}`,
      status: 'done',
      url,
    }));
  } catch (error) {
    console.error('初始化文件列表失败:', error);
    fileList.value = [];
  }
};

// 表单验证
const validateForm = () => {
  const { title, summary, content, top, tagId, cateId } = formData;

  if (!content.trim()) {
    message.error("请编辑文章内容");
    return false;
  }
  if (!title.trim()) {
    message.error("请输入文章标题");
    return false;
  }
  if (!summary.trim()) {
    message.error("请输入文章摘要");
    return false;
  }
  if (top === "" || isNaN(Number(top))) {
    message.error("请选择是否置顶");
    return false;
  }
  if (tagId === "" || isNaN(Number(tagId)) || Number(tagId) <= 0) {
    message.error("请选择标签");
    return false;
  }
  if (cateId === "" || isNaN(Number(cateId)) || Number(cateId) <= 0) {
    message.error("请选择文章分类");
    return false;
  }

  return true;
};

// 文件上传处理
const beforeUpload = (file: any) => {
  if (file.size > 1024 * 1024 * 2) {
    message.error('上传文件大小不能超过2MB!');
    return Upload.LIST_IGNORE;
  }
  fileList.value.push(file);
  return false;
};

const handleRemove = async (file: any) => {
  if (file.status === 'done' && file.url) {
    try {
      const deleteRes = await deleteImage([file.url]);
      if (deleteRes.code === 200) {
        console.log(`移除图片：${file.name}`);
      }
    } catch (error) {
      console.error('删除图片失败:', error);
    }
  }
  const index = fileList.value.indexOf(file);
  fileList.value.splice(index, 1);
};

const handlePreview = async (file: any) => {
  if (!file.url && !file.preview) {
    file.preview = (await getBase64(file.originFileObj)) as string;
  }
  previewImage.value = file.url || file.preview;
  previewVisible.value = true;
  previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1);
};

const coverUpload = async (): Promise<string[]> => {
  try {
    const temp: string[] = [];

    for (const item of fileList.value) {
      if (item.status === 'done' && item.url) {
        temp.push(item.url);
      } else if (item.originFileObj) {
        const formData = new FormData();
        formData.append('file', item.originFileObj);

        const res = await uploadImage(formData);
        if (res.code === 200) {
          const imageUrl = res.data.image;
          item.status = 'done';
          item.url = imageUrl;
          temp.push(imageUrl);
        }
      }
    }
    return temp;
  } catch (error) {
    console.error('封面图处理失败:', error);
    return [];
  }
};

// 提交处理
const submitAdd = async () => {
  if (!validateForm()) return;

  isSave.value = true;

  try {
    const coverRes = await coverUpload();
    const { title, summary, content, html, top, tagId, cateId } = formData;

    const params = {
      tag_id: Number(tagId),
      category_id: Number(cateId),
      article_top: Number(top),
      article_title: title.trim(),
      article_summary: summary.trim(),
      article_content: useEncodeEmoji(content.trim()),
      article_html: html.trim(),
      article_cover: coverRes,
    };

    const res = await addArticles(params);
    if (res.code === 201) {
      message.success("发布成功");
      reset(res.data);
    } else {
      message.error(res.msg);
    }
  } catch (error) {
    console.error('发布失败:', error);
    message.error("发布失败，请重试");
  } finally {
    isSave.value = false;
  }
};

const submitEdit = async () => {
  if (!validateForm()) return;

  const { id } = formData;
  if (!id) {
    message.error("无法获取文章ID");
    return;
  }

  isSave.value = true;

  try {
    const coverRes = await coverUpload();
    const { title, summary, content, html, top, tagId, cateId } = formData;

    const params = {
      article_id: Number(id),
      tag_id: Number(tagId),
      category_id: Number(cateId),
      article_top: Number(top),
      article_title: title.trim(),
      article_summary: summary.trim(),
      article_content: useEncodeEmoji(content.trim()),
      article_html: html.trim(),
      article_cover: coverRes,
    };

    const res = await updateArticle(params);
    if (res.code === 200) {
      message.success("保存成功");
      reset(res.data);
    } else {
      message.error(res.msg);
    }
  } catch (error) {
    console.error('保存失败:', error);
    message.error("保存失败，请重试");
  } finally {
    isSave.value = false;
  }
};

// 工具函数
const reset = (data: any) => {
  state.visible = false;
  fileList.value.length = 0;

  Object.assign(formData, {
    id: null,
    title: "",
    summary: "",
    content: "",
    html: "",
    cateId: "",
    tagId: "",
    top: "0",
    cover: ""
  });

  store.$patch({
    showEdit: false,
    modifiedData: {
      id: data.article_id,
      title: data.article_title,
      summary: data.article_summary,
      content: data.article_content,
      html: data.article_html,
      top: data.article_top,
      like: data.article_like_count,
      read: data.article_read_count,
      comment: data.article_comment_count,
      createTime: data.article_create_time,
      updateTime: data.article_update_time,
      cate: data.category.category_name,
      cateId: data.category.category_id,
      tag: data.tag.tag_name,
      tagId: data.tag.tag_id,
      cover: data.article_cover,
    }
  });
};

const handleCancel = () => {
  previewVisible.value = false;
  previewTitle.value = '';
};

const onClose = () => {
  state.visible = false;
};

const handleClick = () => {
  state.visible = !state.visible;
};

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

    return () => {
      textarea.removeEventListener("input", handler);
    };
  });
};

// 监听器
watchEffect(() => {
  formData.html = props.html;
  formData.content = props.content;
});

// 生命周期
onMounted(() => {
  initializeFormOptions();
  initializeFileList();

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
