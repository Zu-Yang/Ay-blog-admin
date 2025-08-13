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
        <select class="md-editor-input flex-1" :disabled="isSave" v-model.number="formData.top">
          <option v-for="top in formOption.topList" :value="top.value">
            {{ top.label }}
          </option>
        </select>
      </div>
      <div class="md-editor-form-item flex items-center">
        <label class="md-editor-label">文章标签</label>
        <select class="md-editor-input flex-1" :disabled="isSave" v-model.number="formData.tagId">
          <option v-for="tag in formOption.tagList" :value="tag.value">
            {{ tag.label }}
          </option>
        </select>
      </div>
      <div class="md-editor-form-item flex items-center">
        <label class="md-editor-label">文章分类</label>
        <select class="md-editor-input flex-1" :disabled="isSave" v-model.number="formData.cateId">
          <option v-for="cate in formOption.categoryList" :value="cate.value">
            {{ cate.label }}
          </option>
        </select>
      </div>
      <div class="md-editor-form-item flex items-center">
        <label class="md-editor-label">封面图</label>
        <a-upload v-model:file-list="fileList" accept=".png, .jpg, .jpeg, .webp" multiple :progress="progress"
          :max-count="3" list-type="picture-card" :before-upload="beforeUpload" @remove="handleRemove"
          @preview="handlePreview">
          <div v-if="fileList.length < 3">
            <plus-outlined />
            <div style="margin-top: 8px">Upload</div>
          </div>
        </a-upload>
      </div>
      <div class="md-editor-form-item">
        <button v-if="store.modalType === 'create'" class="md-editor-btn" :disabled="isSave || !isModify" type="button"
          @click="submitAdd()">
          {{ isSave ? "正在发布..." : "点击发布" }}
        </button>
        <button v-if="store.modalType === 'edit'" class="md-editor-btn" :disabled="isSave || !isModify" type="button"
          @click="submitEdit()">
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
import { reactive, ref, watchEffect, onMounted, nextTick, watch } from "vue";
import { MdModal } from "md-editor-v3";
import { UploadImage, type UploadChange } from "@/components/Upload";
import { type Message, message, messageBox } from "@/utils/message";
import { deleteImage, uploadImage, updateArticle, addArticles, getCate } from "@/api/blog";
import type { UpdateBlog } from "@/api/blogType";
import { useArticle } from "@/store/Article";
import { Upload } from 'ant-design-vue';
import type { UploadProps } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import { getBase64 } from '@/utils/index';
import { useEncodeEmoji } from '@/utils/comment';

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
        id: "",
        title: "",
        summary: "",
        content: "",
        cateId: "", // 默认值与类型保持一致
        tagId: "", // 默认值与类型保持一致
        top: "", // 默认值与类型保持一致
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

// props.data初始化时,某些值可能变为null
const formData = reactive<UpdateBlog>({
  id: props.data.id || "", // 文章ID
  title: props.data.title || "", // 文章标题
  content: props.content || "", // 文章内容
  html: props.html || "", // 文章HTML
  summary: props.data.summary || "", // 文章摘要
  cover: props.data.cover || [], // 封面图
  top: props.data.top || "", // 0:非置顶, 1:置顶
  tagId: props.data.tagId || "", // 标签id
  cateId: props.data.cateId || "", // 分类id
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

const previewVisible = ref(false);
const previewImage = ref('');
const previewTitle = ref('');
const softDeleteList = ref<any[]>([]);
const fileList = ref<any[]>([]);

if (props.data.cover.length) {
  props.data.cover.forEach((item: any, index: number) => {
    fileList.value.push({
      uid: `vc-done-${index}`,
      status: 'done', // done、uploading、error
      url: item,
    });
  })
}

const progress: UploadProps['progress'] = {
  strokeColor: {
    '0%': '#108ee9',
    '100%': '#87d068',
  },
  strokeWidth: 3,
  format: (percent?: number) => percent ? `${parseFloat(percent.toFixed(2))}%` : '0%',
  class: 'progress', // 进度条的样式名称
};
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
watch(() => [props.content, formData.title, formData.summary, formData.top, formData.tagId, formData.cateId, fileList.value], (newVal) => {
  if (formData.top === "" || formData.tagId === "" || formData.cateId === "") {
    isModify.value = false
  }
  else {
    isModify.value = true
  }
}, { deep: true });

/**
 * 关闭模态框
 */
const handleCancel = () => {
  previewVisible.value = false;
  previewTitle.value = '';
};


/**
 * 移除回调
 * @param file
 * @returns `void`
 */
const handleRemove = async (file: any) => {
  // console.log(file);
  // 软删除已上传的图片
  if (file.status === 'done' && file.url) {
    softDeleteList.value.push(file);
  }
  const index = fileList.value.indexOf(file);
  fileList.value.splice(index, 1);
};

/**
 * 上传前的回调
 * @param file
 * @returns `false` 阻止上传
 */
const beforeUpload = (file: any) => {
  // 限制上传图大小
  if (file.size > 1024 * 1024 * 2) {
    message.error('上传文件大小不能超过2MB!');
    return Upload.LIST_IGNORE; // 如果需要阻止列表展现，可以通过返回 Upload.LIST_IGNORE 实现。
  }
  fileList.value.push(file);
  return false;
};

/**
 * 封面图处理
 * @returns `string[]`
 */
const handleCover = async () => {
  const coverMap: string[] = [];

  try {
    // 第一步：处理需要删除的图片
    // 检查是否有需要删除的图片
    if (softDeleteList.value.length > 0) {
      // 从softDeleteList中提取所有图片的URL
      const urlsToDelete = softDeleteList.value.map(item => item.url);
      // 调用删除图片的API
      const deleteRes = await deleteImage(urlsToDelete);
      // 如果删除成功，清空softDeleteList
      if (deleteRes.code === 200) {
        softDeleteList.value = [];
      }
    }

    // 第二步：处理需要上传的图片
    // 检查是否有需要上传的图片
    if (fileList.value.length > 0) {
      // 对fileList中的每个文件进行处理
      const uploadPromises = fileList.value.map(async (item) => {
        // 如果文件已经上传完成，直接返回其URL
        if (item.status === 'done') {
          return item.url;
        } else {
          // 对于新文件，创建FormData对象并添加文件
          const formData = new FormData();
          formData.append('file', item.originFileObj);
          // 调用上传图片的API
          const uploadRes = await uploadImage(formData);
          // 如果上传成功，返回图片URL
          if (uploadRes.code === 200) {
            return uploadRes.data.image;
          }
          // 上传失败返回null
          return null;
        }
      });

      // 等待所有上传操作完成
      const results = await Promise.all(uploadPromises);
      // 将成功上传的图片URL添加到coverMap中
      coverMap.push(...results.filter(url => url !== null));
    }

    return coverMap;
  } catch (error) {
    console.error('封面图处理失败:', error);
    return [];
  }
}


/**
 * 点击文件链接或预览图标时的回调
 */
const handlePreview = async (file: any) => {
  if (!file.url && !file.preview) {
    file.preview = (await getBase64(file.originFileObj)) as string;
  }
  previewImage.value = file.url || file.preview;
  previewVisible.value = true;
  previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1);
};

/**
 * 重置数据
 */
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
    // 属性与TableDataType一致
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
  })
}

/**
 * 文章修改
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
  // } else if (!fileList.value.length) {
  //   message.error("请上传文章封面图");
  //   return;
  }

  isSave.value = true;

  // 封面图上传
  let coverMap = <string[]>[];
  if (fileList.value.length) {
    coverMap = await handleCover()
    if (!coverMap || coverMap.length === 0) {
      message.error("封面图处理失败，请重新上传");
      isSave.value = false;
      return;
    }
  }

  const params = {
    article_id: id,
    tag_id: Number(tagId),
    category_id: Number(cateId),
    article_top: Number(top),
    article_title: title.trim(),
    article_summary: summary.trim(),
    article_content: useEncodeEmoji(content.trim()),
    article_html: html.trim(),
    article_cover: JSON.stringify(coverMap),
  };

  // console.log(params);
  // return;
  const res = await updateArticle(params);
  if (res.code === 200) {
    message.success("发布成功");
    reset(res.data)
  } else {
    message.error(res.msg);
  }
  isSave.value = false;
};

/**
 * 新增文章
 */
const submitAdd = async () => {
  const { title, summary, cover, content, html, top, tagId, cateId } = formData;
  // 校验参数
  if (!content) {
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
  // } else if (!fileList.value.length) {
  //   message.error("请上传文章封面图");
  //   return;
  }
  isSave.value = true;

   // 封面图上传
   let coverMap = <string[]>[];
  if (fileList.value.length) {
    coverMap = await handleCover()
    if (!coverMap || coverMap.length === 0) {
      message.error("封面图处理失败，请重新上传");
      isSave.value = false;
      return;
    }
  }


  const params = {
    tag_id: Number(tagId),
    category_id: Number(cateId),
    article_top: Number(top),
    article_title: title.trim(),
    article_summary: summary.trim(),
    article_content: useEncodeEmoji(content.trim()),
    article_html: html.trim(),
    article_cover: JSON.stringify(coverMap),
  };
  // console.log(params);
  // return;
  const res = await addArticles(params);
  if (res.code === 200) {
    message.success("发布成功");
    reset(res.data)
  } else {
    message.error(res.msg);
  }
  isSave.value = false;
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
