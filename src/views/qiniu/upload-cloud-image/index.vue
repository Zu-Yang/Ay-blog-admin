<template>
  <div class="upload-container">
    <a-space class="mb-4">
      <h3>上传目录：</h3>
      <a-cascader
        v-model:value="cascaderVal"
        :allowClear="false"
        style="width: fit-content"
        :options="cascaderOptions"
        placeholder="请选择目录"
        expand-trigger="hover"
        @change="handleCascaderChange"
      />
      <div v-if="dir">文件会上传到此目录：{{ dir }}</div>
    </a-space>
    <a-upload-dragger
      class="block"
      v-model:file-list="fileList"
      list-type="picture"
      accept="image/png, image/jpeg, image/jpg, image/gif, image/bmp, image/webp, image/svg+xml"
      multiple
      :before-upload="beforeUpload"
      :customRequest="handleUpload"
      @change="handleChange"
      @drop="handleDrop"
      @remove="handleRemove"
    >
      <p class="ant-upload-drag-icon">
        <inbox-outlined />
      </p>
      <p class="ant-upload-text">单击或拖动文件到此区域以上传</p>
      <p class="ant-upload-hint">
        支持单次或批量上传。严禁上传违法违规图片，否则后果自负。
      </p>
      <p class="ant-upload-hint">
        文件格式支持：JPG/JPEG/PNG/GIF/BMP/WEBP/SVG，大小不能超过5M
      </p>
      <template #itemRender="{ file, actions }">
        <!-- 上传进度 -->
        <!-- <a-progress
          :percent="file.percent"
          :status="file.percent === 100 ? 'success' : 'active'"
        /> -->
        <div class="preview-item" :key="file.uid">
          <div class="image">
            <img v-if="file.thumbUrl" :src="file.thumbUrl" alt="" />
          </div>
          <div v-if="file.response" class="url">
            <a :href="file.response.url ? file.response.url : ''" target="_blank">
              <a-typography-paragraph
                class="copy"
                :status="file.status"
                :copyable="{ text: file.response.url ? file.response.url : '' }"
                ellipsis
                :content="file.name"
              >
              </a-typography-paragraph>
            </a>
          </div>
          <span v-else-if="!file.response" class="url">
            {{ file.name }}
          </span>
          <span class="delete" title="删除" @click="actions.remove">
            <DeleteOutlined />
          </span>
        </div>
      </template>
    </a-upload-dragger>
  </div>
</template>

<script lang="ts">
export default {
  name: "QiniuCloudImage",
};
</script>

<script setup lang="ts">
import { ref, watch } from "vue";
import { InboxOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import type {
  UploadChangeParam,
  CascaderProps,
  UploadFile,
  UploadProps,
} from "ant-design-vue";
import { uploadToQiniu } from "@/api/qiniu";
import { useQiniu } from "@/store/Qiniu";
const qiniuStore = useQiniu();

const fileList = ref<UploadFile[]>([]);
const dir = ref<string>(qiniuStore.dir);
const cascaderVal = ref<string[]>(["ay-blog-images/", "test/"]);
const cascaderOptions: CascaderProps["options"] = [
  {
    value: "ay-blog-images/",
    label: "ay-blog-images",
    children: [
      {
        value: "test/",
        label: "test",
        children: [],
      },
      {
        value: "wallpaper/",
        label: "wallpaper",
        children: [
          {
            value: "full/",
            label: "full",
          },
          {
            value: "half/",
            label: "half",
          },
        ],
      },
    ],
  },
];
// 自定义上传元数据
const metadata = ref({
  author: "yang",
  name: "自定义图片名称",
  tag: "图片标签",
  color: "图片主要颜色",
  description: "这是一张示例图片",
  width: "",
  height: "",
});

watch(
  cascaderVal,
  newVal => {
    if (newVal) {
      dir.value = newVal.join("");
      qiniuStore.dir = dir.value;
    }
  },
  { deep: true, immediate: true }
);

/**
 * 优化多张上传的自定义上传处理
 * Ant Design Vue 的 customRequest 会为每个文件单独调用
 */
const handleUpload = async (options: any) => {
  const { file, onSuccess, onError, onProgress } = options;
  const target = fileList.value.find(f => f.uid === file.uid);

  if (!target) {
    onError && onError(new Error(`未找到文件:${file.name}`));
    return;
  }
  target.status = "uploading";
  onProgress && onProgress({ percent: 0 });

  try {
    // 获取图片分辨率
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise(resolve => {
      img.onload = () => {
        metadata.value.width = img.width.toString();
        metadata.value.height = img.height.toString();
        URL.revokeObjectURL(img.src);
        resolve(null);
      };
    });

    // 传递目录参数
    const result = await uploadToQiniu(target, metadata.value);
    onProgress && onProgress({ percent: 100 });
    onSuccess && onSuccess(result, file);
  } catch (error: any) {
    onError && onError(error);
    message.error(`文件上传失败:`, error.message);
    console.error(`上传文件失败:`, error);
  }
};
/**
 * 上传前校验
 * beforeUpload 返回 true 自动上传 ，返回 false 手动上传文件。
 */
const beforeUpload = (_file: File, _fileList: File[]) => {
  // // 验证图片名称是否合法
  // const fileName = _file.name;
  // // 禁止文件名包含特殊字符和空格
  // const invalidChars = /[\\/:*?"<>|&%#@!^()+={}\[\]、，。；：'"￥~`\s]/;
  // if (invalidChars.test(fileName)) {
  //   message.error(
  //     '文件名不能包含以下字符: \\ / : * ? " < > | & % # @ ! ^ ( ) + = { } [ ] 、，。；：\' " ￥ ~ ` 以及空格',
  //     5000
  //   );
  //   return false;
  // }

  // 增加可上传图片类型：支持 jpg、jpeg、png、gif、bmp、webp、svg
  const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/webp",
    "image/svg+xml",
    "image/jpg",
  ];
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  if (!ALLOWED_TYPES.includes(_file.type)) {
    message.error("仅支持上传 JPG/JPEG/PNG/GIF/BMP/WEBP/SVG 格式图片");
    return false;
  }
  if (_file.size > MAX_SIZE) {
    message.error("图片大小不能超过 2MB");
    return false;
  }
  return true;
};

/**
 * 移除图片
 */
const handleRemove = (file: UploadFile) => {
  if (!fileList.value) {
    message.error("文件列表为空");
    return;
  }
  fileList.value = fileList.value.filter(item => item.uid !== file.uid);
};

/**
 * 选择上传目录
 */
const handleCascaderChange = (
  value: string[],
  selectedOptions: CascaderProps["options"]
) => {
  // dir.value = value.join('');
};

/**
 * 上传文件状态变化
 */
const handleChange = (options: UploadChangeParam) => {
  // const _fileList = options.fileList;
  // // 限制最多上传5个文件
  // const MAX_FILES = 5;
  // // 如果文件列表超过限制，移除多余的文件
  // if (_fileList.length > MAX_FILES) {
  //   // 保留前5个文件，移除其余文件
  //   const excessFiles = _fileList.slice(MAX_FILES);
  //   fileList.value = _fileList.slice(0, MAX_FILES);
  //   message.warning(`一次最多只能选择${MAX_FILES}个文件，保留了前5个文件`);
  //   // 从UI上移除多余的文件
  //   excessFiles.forEach((file) => {
  //     handleRemove(file);
  //   });
  // }
};

/**
 * 文件拖拽回调
 */
const handleDrop = (e: DragEvent) => {
  // console.log('拖拽事件:', e);
};
</script>

<style lang="scss" scoped>
.upload-container {
  padding: 20px;
  width: 100%;
  margin: 0 auto;
}

:deep(.ant-upload-list-item-container) {
  height: fit-content !important;

  .ant-upload-list-item {
    height: 46px !important;
  }
}

.block {
  margin-bottom: 16px;
}

.uploaded-files-list {
  margin-top: 24px;
  border-top: 1px solid #eee;
  padding-top: 16px;

  .uploaded-list-item {
    margin-bottom: 12px;
  }

  .ant-tag {
    display: flex;
    justify-content: space-between;
  }

  .ant-typography {
    margin: 0;
  }

  h3 {
    margin-bottom: 12px;
    font-size: 16px;
  }
}

.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  padding: 4px 12px;
  box-sizing: border-box;
  margin-top: 12px;
  .image {
    width: 48px;
    img {
      max-width: 100%;
      max-height: 100%;
    }
  }
  .url {
    display: block;
    flex: 1;
    margin-left: 12px;
    .copy {
      margin: 0;
      cursor: pointer;
    }
    .copy[status="done"] {
      color: #52c41a;
    }
    .copy[status="error"] {
      color: #ff4d4f;
    }
  }
  .delete {
    color: #ff4d4f;
    cursor: pointer;
  }
}
</style>
