<template>
  <div class="scroll-wrap" scroll-container>
    <Waterfall
      :list="imageList"
      :loadProps="waterfallOptions.loadProps"
      :width="waterfallOptions.width"
      :backgroundColor="waterfallOptions.backgroundColor"
      :posDuration="waterfallOptions.posDuration"
      :animationDelay="waterfallOptions.animationDelay"
      :animationDuration="waterfallOptions.animationDuration"
      :animationPrefix="waterfallOptions.animationPrefix"
      :animationEffect="waterfallOptions.animationEffect"
      :lazyload="waterfallOptions.lazyload"
    >
      <template #default="{ item, index }">
        <div class="image-card" scroll-reveal :key="index">
          <LazyImg :url="item.url" :id="`zoom-${index}`" alt="" />
          <div class="image-mask"></div>
          <div class="image-actions">
            <a-button
              class="open-btn"
              type="text"
              shape="round"
              @click="openZoom(`zoom-${index}`)"
              title="查看"
            >
              <template #icon>
                <SearchOutlined />
              </template>
            </a-button>
            <a-button
              class="download-btn"
              type="text"
              shape="round"
              @click="downloadImage(item.url as string)"
              title="下载"
            >
              <template #icon>
                <DownloadOutlined />
              </template>
            </a-button>
          </div>
          <div class="image-info">
            <div class="image-name" :title="item.key">
              {{
                item.key
                  .split("/")
                  .pop()
                  .replace(/\.[^/.]+$/, "")
              }}
            </div>
            <div class="image-meta">
              <!-- <span class="image-type" title="文件类型">
                {{ item.mimeType }}
              </span> -->
              <span class="image-size" title="文件大小">
                {{
                  item.fsize > 1000000
                    ? (item.fsize / 1000000).toFixed(2) + "MB"
                    : (item.fsize / 1000).toFixed(2) + "kB"
                }}
              </span>

              <span class="image-time" title="分辨率">
                {{ item["x-qn-meta"].width + "x" + item["x-qn-meta"].height }}
              </span>
            </div>
            <!-- <div class="image-meta">
              <span class="image-time" title="上传时间">
                {{ dayjs(item.putTime / 10000).format("YYYY-MM-DD HH:mm:ss") }}
              </span>
            </div> -->
          </div>
        </div>
      </template>
    </Waterfall>
  </div>
</template>

<script lang="ts">
import { ref, reactive, onMounted } from "vue";
import mediumZoom from "medium-zoom";
// @ts-ignore
import ScrollReveal from "scrollreveal";
import { getQiniuList } from "@/api/qiniu";
import { v4 } from "uuid";
import dayjs from "dayjs";
import loadingImg from "@/assets/image-loading1.gif";
import errorImg from "@/assets/image-error1.png";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import BScroll from "better-scroll";

interface QiniuFile {
  key: string;
  hash: string;
  url?: string;
  fsize: number;
  mimeType: string;
  putTime: number;
  lastModify: number;
  type: number;
  status: number;
  md5: string;
}

export default {
  name: "cloud-image-list",
};

/**
 * 相关文档
 * 瀑布流：https://www.npmjs.com/package/vue-waterfall-plugin-next
 * 图片懒加载：https://www.npmjs.com/package/vue-lazyload
 * 图片预览：https://www.npmjs.com/package/medium-zoom
 * 图片滚动展示：https://www.npmjs.com/package/scrollreveal
 */
</script>

<script setup lang="ts">
const imageList = ref<QiniuFile[]>([]);
const loading = ref(true);

/**
 * 瀑布流组件配置
 */
const waterfallOptions = reactive({
  rowKey: "",
  imgSelector: "",
  width: 340,
  gutter: 18,
  backgroundColor: "transparent",
  posDuration: 600, // 卡片移动到正确位置的动画时间
  animationPrefix: "animate__animated",
  animationEffect: "fadeIn",
  animationDuration: 1000, // 卡片动画时间
  animationDelay: 600, // 卡片动画延迟时间
  animationCancel: false,
  lazyload: true, // 懒加载
  crossOrigin: true,
  delay: 300, // 布局刷新延迟
  align: "center",
  horizontalOrder: true,
  heightDifference: 0,
  loadProps: {
    loading: loadingImg,
    error: errorImg,
    // ratioCalculator: (width: number, height: number) => {
    //   const minRatio = 3 / 4;
    //   const maxRatio = 4 / 3;
    //   const curRatio = width / height;
    //   if (curRatio < minRatio) {
    //     return minRatio;
    //   } else if (curRatio > maxRatio) {
    //     return maxRatio;
    //   } else {
    //     return curRatio;
    //   }
    // },
  },
});

/**
 * medium-zoom 配置
 */
const zoomOptions = {
  margin: 0,
  scrollOffset: 0,
  background: "rgba(255,255,255,0.9)",
  // template: "#template-dropbox-paper",
  // container: "[data-zoom-container]",
};

/**
 * ScrollReveal 配置
 */
const revealOptions = {
  delay: 100,
  distance: "20px",
  duration: 600,
  easing: "cubic-bezier(0.5, 0, 0, 1)",
  interval: 100,
  opacity: 0,
  origin: "bottom",
  rotate: { x: 0, y: 0, z: 0 },
  scale: 0.98,
  cleanup: true,
  container: document.querySelector(".the-layout-content"),
  desktop: true,
  mobile: true,
  reset: false,
  useDelay: "always",
  viewFactor: 0.0,
  viewOffset: { top: 0, right: 0, bottom: 0, left: 0 },
  afterReset: function () {},
  afterReveal: function () {},
  beforeReset: function () {},
  beforeReveal: function () {},
};

const getImageList = async () => {
  loading.value = true;
  try {
    const { code, data } = await getQiniuList();
    if (code == 200) {
      data.list.forEach((item: QiniuFile) => {
        const url = `${import.meta.env.VITE_QINIU_BASE_PATH}/${item.key}`;
        imageList.value.push({ ...item, url });
      });
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const openZoom = (selector: string) => {
  const className = "#" + selector + " .lazy__img";

  const zoom = mediumZoom(className, zoomOptions);

  zoom.open();

  // zoom.on("closed", () => {
  //   zoom.detach(); // 关闭后解绑
  // });
};

const downloadImage = async (url: string) => {
  if (!url) {
    message.error("下载失败：URL 缺失。");
    return;
  }
  const effectiveFilename = v4();
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`下载失败：HTTP 错误 ${response.status}`);
      return;
    }
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = effectiveFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 100);
  } catch (error) {
    console.error("下载过程中发生错误:", error);
  }
};

onMounted(async () => {
  await getImageList();
  // ScrollReveal().reveal(".image-card", revealOptions);
  // 开启鼠标拖拽模式
  // new BScroll(".scroll-wrap", {
  //   pullUpLoad: true,
  //   scrollbar: true,
  //   pullDownRefresh: true,
  // });
});
</script>

<style lang="scss" scoped>
.scroll-wrap {
  width: 100%;
}

.image-card {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 4px 8px 0 rgba(40, 60, 90, 0.06);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  transition: all 0.6s cubic-bezier(0.22, 0.61, 0.36, 1);
  :deep(.lazy__box) {
    transition: all 0.6s cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  :deep(.lazy__img) {
    width: 100%;
    object-fit: cover;
    transition: width 0.6s cubic-bezier(0.22, 0.61, 0.36, 1),
      transform 5s cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  :deep(.lazy__img[lazy="loading"]) {
    width: 64px;
    opacity: 0.3;
  }

  :deep(.lazy__img[lazy="loaded"]) {
    width: 100%;
    opacity: 1;
  }

  :deep(.lazy__img[lazy="error"]) {
    width: 64px;
    opacity: 0.3;
  }

  &:hover {
    box-shadow: 0 8px 16px 0 rgba(40, 60, 90, 0.3);

    :deep(.lazy__img) {
      transform: scale(1.2);
    }
    .image-info {
      opacity: 1;
      transform: translateY(0);
      visibility: visible;
    }
    .image-mask {
      opacity: 1;
      visibility: visible;
    }
    .image-actions {
      opacity: 1;
      visibility: visible;
      transform: translateX(0);
    }
  }
  .image-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      rgba(0, 0, 0, 0.5),
      transparent 30%,
      transparent 70%,
      rgba(0, 0, 0, 0.5)
    );
    opacity: 0;
    transition: all 0.3s linear;
    visibility: hidden;
  }
  .image-info {
    width: 100%;
    position: absolute;
    bottom: 0;
    transform: translateY(100%);
    padding: 0px 12px 12px;
    background: transparent;
    display: flex;
    flex-direction: column;
    gap: 4px;
    box-sizing: border-box;
    // transition: all 0.8s
    //   linear(
    //     0 0%,
    //     0 1.8%,
    //     0.01 3.6%,
    //     0.03 6.35%,
    //     0.07 9.1%,
    //     0.13 11.4%,
    //     0.19 13.4%,
    //     0.27 15%,
    //     0.34 16.1%,
    //     0.54 18.35%,
    //     0.66 20.6%,
    //     0.72 22.4%,
    //     0.77 24.6%,
    //     0.81 27.3%,
    //     0.85 30.4%,
    //     0.88 35.1%,
    //     0.92 40.6%,
    //     0.94 47.2%,
    //     0.96 55%,
    //     0.98 64%,
    //     0.99 74.4%,
    //     1 86.4%,
    //     1 100%
    //   );
    transition: all 0.6s cubic-bezier(0.22, 0.61, 0.36, 1);
    visibility: hidden;
    opacity: 0;

    .image-name {
      font-weight: 600;
      color: #ffffff;
      font-size: 19px;
      word-break: break-all;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      line-clamp: 1;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
    }
    .image-meta {
      display: flex;
      align-items: center;
      gap: 18px;
      font-size: 12px;
      color: #cccccc;
      .image-type {
        font-size: 12px;
      }
      .image-size {
        font-size: 12px;
      }
      .image-time {
        font-size: 12px;
      }
    }
  }
  .image-actions {
    padding: 12px 12px 0px 0px;
    box-sizing: border-box;
    position: absolute;
    right: 0px;
    top: 0px;
    z-index: 2;
    gap: 4px;
    display: flex;
    flex-direction: column;
    transition: all 0.6s cubic-bezier(0.22, 0.61, 0.36, 1);
    // transition: all 1.2s
    //   linear(
    //     0 0%,
    //     0 1.8%,
    //     0.01 3.6%,
    //     0.03 6.35%,
    //     0.07 9.1%,
    //     0.13 11.4%,
    //     0.19 13.4%,
    //     0.27 15%,
    //     0.34 16.1%,
    //     0.54 18.35%,
    //     0.66 20.6%,
    //     0.72 22.4%,
    //     0.77 24.6%,
    //     0.81 27.3%,
    //     0.85 30.4%,
    //     0.88 35.1%,
    //     0.92 40.6%,
    //     0.94 47.2%,
    //     0.96 55%,
    //     0.98 64%,
    //     0.99 74.4%,
    //     1 86.4%,
    //     1 100%
    //   );
    transform: translateX(100%);
    visibility: hidden;
    opacity: 0;

    .download-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      transition: background 0.18s, color 0.18s, box-shadow 0.18s, backdrop-filter 0.18s;
      cursor: pointer;
      &:hover {
        color: #000000;
        background-color: rgba(255, 255, 255, 1);
      }
      &:active {
        transform: scale(0.95);
      }
    }
    .open-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      transition: background 0.18s, color 0.18s, box-shadow 0.18s, backdrop-filter 0.18s;
      cursor: pointer;
      &:hover {
        color: #000000;
        background-color: rgba(255, 255, 255, 1);
      }
      &:active {
        transform: scale(0.95);
      }
    }
  }
}
</style>
