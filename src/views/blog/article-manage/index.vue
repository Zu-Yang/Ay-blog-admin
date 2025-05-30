<template>
  <div>
    <div class="mb-4">
      <a-button type="primary" danger :disabled="!hasSelected" :loading="selectState.loading" @click="start">
        批量删除
        <span v-if="hasSelected">
          {{ `&nbsp;${selectState.selectedRowKeys.length} items` }}
        </span>
      </a-button>
      <a-button type="primary" :disabled="!hasSelected" :loading="selectState.loading" @click="start">
        创建文档
        <span v-if="hasSelected">
          {{ `&nbsp;${selectState.selectedRowKeys.length} items` }}
        </span>
      </a-button>
    </div>
    <a-table :row-selection="{
      selectedRowKeys: selectState.selectedRowKeys,
      onChange: handleCheckChange,
    }" :row-key="(record: TableDataType) => record.id" :pagination="pagination" :columns="columns"
      :data-source="dataSource" :loading="loading" :scroll="{ x: 1500, y: 600 }" :expand-column-width="40"
      @change="handleTableChange" @resizeColumn="(w: number, col: TableColumnType) => col.width = w">
      <!-- 自定义head内容 -->
      <template #headerCell="{ column }"> </template>
      <!-- 展开列标题 -->
      <template #expandColumnTitle>
        <span>More</span>
      </template>
      <!-- 展开内容 -->
      <template #expandedRowRender="{ record }"> </template>
      <!-- 自定义筛选 -->
      <template #customFilterDropdown="{
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
        column,
      }">
        <!-- 弹窗内容 -->
        <div style="padding: 8px">
          <a-input ref="searchInput" :placeholder="`Search ${column.dataIndex}`" :value="selectedKeys[0]"
            style="width: 188px; margin-bottom: 8px; display: block"
            @change="(e: any) => setSelectedKeys(e.target.value ? [e.target.value] : [])"
            @pressEnter="handleSearch(selectedKeys, confirm, column.dataIndex)" />
          <a-button type="primary" size="small" style="width: 90px; margin-right: 8px"
            @click="handleSearch(selectedKeys, confirm, column.dataIndex)">
            <!-- <template #icon><SearchOutlined /></template> -->
            Search
          </a-button>
          <a-button size="small" style="width: 90px" @click="handleReset(clearFilters)">
            Reset
          </a-button>
        </div>
      </template>
      <!-- 自定义筛选图标 -->
      <template #customFilterIcon="{ filtered, column }">
        <div>
          <SearchOutlined v-if="column.customFilterDropdown" :style="{ color: filtered ? '#108ee9' : undefined }" />
          <FilterFilled v-else :style="{ color: filtered ? '#108ee9' : undefined }" />
        </div>
      </template>
      <!-- 自定义body内容 -->
      <template #bodyCell="{ text, record, column }">
        <!-- 高亮筛选文本 -->
        <span v-if="searchState.searchText && searchState.searchedColumn === column.dataIndex">
          <template v-for="(fragment, i) in text
            .toString()
            .split(
              new RegExp(
                `(?<=${searchState.searchText})|(?=${searchState.searchText})`,
                'i'
              )
            )">
            <mark v-if="fragment.toLowerCase() === searchState.searchText.toLowerCase()" :key="i" class="highlight">
              {{ fragment }}
            </mark>
            <template v-else>{{ fragment }}</template>
          </template>
        </span>
        <!-- 是否置顶 -->
        <span v-else-if="column.dataIndex === 'top'">
          {{ text === 1 ? "是" : "否" }}
        </span>
        <!-- 封面图 -->
        <span v-else-if="column.dataIndex === 'cover'">
          <a-image :preview="{ visible: false }" :src="text[0]" @click="!record.error && (record.visible = true)"
            placeholder
            fallback="data:image/png;base64,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"
            @error="record.error = true" :alt="text[0]" />
          <div v-if="!record.error" style="display: none">
            <a-image-preview-group :preview="{
              visible: record.visible,
              onVisibleChange: (vis: boolean) => (record.visible = vis),
            }">
              <a-image v-for="item in text" :src="item" :key="item" :alt="item" />
            </a-image-preview-group>
          </div>
        </span>
        <!-- 格式化日期 -->
        <span v-else-if="
          column.dataIndex === 'createTime' || column.dataIndex === 'updateTime'
        ">
          {{ dayjs(text).format("YYYY-MM-DD HH:mm:ss") }}
        </span>
        <!-- 操作按钮 -->
        <span v-else-if="column.dataIndex === 'action'">
          <!-- 预览/编辑/删除按钮 -->
          <div class="flex justify-center gap-2">
            <!-- 预览按钮 -->
            <a-tooltip>
              <template #title>预览</template>
              <a-button type="link" size="small" @click="handlePreview(record)">
                <template #icon>
                  <EyeOutlined />
                </template>
              </a-button>
            </a-tooltip>
            <!-- 编辑按钮 -->
            <a-tooltip>
              <template #title>编辑</template>
              <a-button type="link" size="small" @click="handleEdit(record)">
                <template #icon>
                  <EditOutlined />
                </template>
              </a-button>
            </a-tooltip>
            <!-- 删除按钮 -->
            <a-popconfirm placement="bottom" title="删除这篇文章吗?" ok-text="确定" cancel-text="取消" @confirm="handleDelete">
              <a-button type="link" size="small" danger>
                <template #icon>
                  <DeleteOutlined />
                </template>
              </a-button>
            </a-popconfirm>
          </div>
        </span>
      </template>
    </a-table>
    <a-modal v-model:open="showPreview" :width="isMdPreviewCatalog ? '1200px' : '1000px'" style="top: 24px"
      wrapClassName="ant-modal-preview" :footer="null" destroyOnClose>
      <!-- 侧边目录 -->
      <MdCatalog id="md-preview-catalog" class="w-[200px] pl-4 sticky top-[0] right-0 z-100 float-right"
        :editorId="editorId" scrollElement=".ant-modal-preview" :scrollElementOffsetTop="0" />
      <!-- 主题内容 -->
      <div :class="{ 'pr-[200px]': isMdPreviewCatalog }">
        <!-- 标题 -->
        <div class="mb-6">
          <h2 class="text-3xl font-bold text-center line-clamp-1">
            {{ statePreview.title }}
          </h2>
        </div>
        <!-- 摘要 -->
        <div class="rounded-xl mb-6 p-4 bg-white shadow-xl dark:bg-black">
          <div class="mb-2">
            <span> 摘要 </span>
          </div>
          <p class="line-clamp-4">
            {{ statePreview.summary }}
          </p>
        </div>
        <MdPreview class="rounded-xl p-0 bg-white shadow-xl dark:bg-black" v-model="statePreview.content"
          :editorId="editorId" />
      </div>
    </a-modal>
    <a-modal v-model:open="store.showEdit" width="100%" wrapClassName="ant-modal-editor" destroyOnClose :footer="null"
      :keyboard="false" :maskClosable="false" :mask="false">
      <MarkdownEditor :editorId="editorId" :data="stateEdit" />
    </a-modal>
  </div>
</template>
<script lang="ts" setup async>
import { reactive, onMounted, ref, computed, nextTick, watchEffect, watch } from "vue";
import type { TableColumnType, TableProps } from "ant-design-vue";
import {
  SearchOutlined,
  FilterFilled,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons-vue";
import { getArticles, getCate, getTag } from "@/api/blog";
import type { BlogList, TableDataType } from "@/api/blogType";
import { MdCatalog, MdPreview } from "md-editor-v3";
import dayjs from "dayjs";
import { MarkdownEditor } from "@/components/MdEditor";
import { useArticle } from "@/store/Article";

const store = useArticle();

const editorId = ref<string>("");
const showPreview = ref<boolean>(false);
const statePreview = reactive({
  id: 1,
  title: "",
  summary: "",
  content: "",
});
const stateEdit = reactive({
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
});
const loading = ref(false);
const searchInput = ref();
const isMdPreviewCatalog = ref(false);
const dataSource = reactive<object[]>([]);
const searchState = reactive({ searchText: "", searchedColumn: "" });
const cateFilter = reactive<{ text: string; value: number }[]>([]);
const tagFilter = reactive<{ text: string; value: number }[]>([]);
const pagination = reactive({ total: 0, current: 1, pageSize: 12 });
const columns: TableColumnType<TableDataType>[] = [
  {
    title: "ID",
    dataIndex: "id",
    fixed: "left",
    width: 30,
    ellipsis: true,
  },
  {
    title: "封面图",
    dataIndex: "cover",
    width: 100,
    ellipsis: true,
  },
  {
    title: "标题",
    dataIndex: "title",
    // fixed: "left",
    width: 100,
    minWidth: 100,
    maxWidth: 200,
    ellipsis: true,
    resizable: true,
    customFilterDropdown: true,
    onFilter: (value, record) => {
      if (typeof value === "string") {
        return record.title.toString().toLowerCase().includes(value.toLowerCase());
      }
      return false;
    },
    // 点击筛选按钮时触发
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => {
          searchInput.value.focus();
        }, 100);
      }
    },
  },
  {
    title: "是否置顶",
    dataIndex: "top",
    width: 60,
    ellipsis: true,
    filters: [
      {
        text: "是",
        value: 1,
      },
      {
        text: "否",
        value: 0,
      },
    ],
    onFilter: (value, record) => record.top === value,
    filterMultiple: false, // 是否多选
  },
  {
    title: "分类",
    dataIndex: "cate",
    width: 50,
    ellipsis: true,
    filters: cateFilter,
    onFilter: (value, record) => record.cateId === value,
  },
  {
    title: "标签",
    dataIndex: "tag",
    width: 50,
    ellipsis: true,
    filterMultiple: true, // 是否多选
    filters: tagFilter,
    onFilter: (value, record) => record.tagId === value,
  },
  {
    title: "点赞数",
    dataIndex: "like",
    width: 50,
    ellipsis: true,
    sorter: {
      compare: (a, b) => a.like - b.like,
      multiple: 5, // 排序权重
    },
  },
  {
    title: "阅读数",
    dataIndex: "read",
    width: 50,
    ellipsis: true,
    sorter: {
      compare: (a, b) => a.read - b.read,
      multiple: 4, // 排序权重
    },
  },
  {
    title: "评论数",
    dataIndex: "comment",
    width: 50,
    ellipsis: true,
    sorter: {
      compare: (a, b) => a.comment - b.comment,
      multiple: 3, // 排序权重
    },
  },
  {
    title: "创建时间",
    dataIndex: "createTime",
    width: 80,
    ellipsis: true,
    sorter: {
      compare: (a, b) => a.createTime - b.createTime,
      multiple: 2, // 排序权重
    },
  },
  {
    title: "更新时间",
    dataIndex: "updateTime",
    width: 80,
    ellipsis: true,
    sorter: {
      compare: (a, b) => a.updateTime - b.updateTime,
      multiple: 1, // 排序权重
    },
  },
  {
    title: "操作",
    dataIndex: "action",
    fixed: "right",
    width: 80,
    ellipsis: true,
  },
];

/**
 * 热更新被修改的`article`数据
 */
watchEffect(() => {
  if (Object.keys(store.modifiedData).length !== 0) {
    // acc: 累加器，初始值为空数组
    // item: 当前遍历的数组元素
    // index: 当前元素的索引
    dataSource.reduce((acc: any, item: any, index: number) => {
      // 检查当前元素的id是否与修改后的数据id匹配
      if (item.id === store.modifiedData.id) {
        // 如果匹配，使用Object.assign将修改后的数据合并到原数据中
        // 这样可以保留原数据的其他属性，只更新被修改的部分
        Object.assign(dataSource[index], store.modifiedData);
        // 清空store.modifiedData，以便下次修改
        store.$patch({ modifiedData: {} });
        // 跳出循环
        return;
      }
      // 返回累加器，继续下一次迭代
      return acc;
    }, []); // 初始值为空数组
  };
})

type Key = string | number;

const selectState = reactive<{ selectedRowKeys: Key[]; loading: boolean }>({
  selectedRowKeys: [], // Check here to configure the default column
  loading: false,
});
const hasSelected = computed(() => selectState.selectedRowKeys.length > 0);

/**
 * 初始化modal样式
 * @returns
 */
const initMdPreview = () => {
  nextTick(() => {
    const el = document.getElementById("md-preview-catalog");
    if (el?.children.length) isMdPreviewCatalog.value = true;
    else isMdPreviewCatalog.value = false;
  });
};

/**
 * 预览文章
 * @param record
 */
const handlePreview = (record: TableDataType) => {
  editorId.value = `md-preview-${record.id}`;
  Object.assign(statePreview, {
    id: record.id,
    title: record.title,
    summary: record.summary,
    content: record.content,
  });
  showPreview.value = true;
  initMdPreview();
};

/**
 * 编辑文章
 * @param record
 */
const handleEdit = (record: TableDataType) => {
  console.log(record);
  editorId.value = `md-edit-${record.id}`;
  Object.assign(stateEdit, {
    id: record.id,
    content: record.content,
    title: record.title,
    summary: record.summary,
    top: record.top,
    cateId: record.cateId,
    tagId: record.tagId,
    cover: record.cover,
  });
  store.$patch({ showEdit: true });
};

/**
 * 删除文章
 * @param record
 */
const handleDelete = (record: TableDataType) => { };

/**
 * 操作按钮
 */
const start = () => {
  selectState.loading = true;
  // ajax request after empty completing
  setTimeout(() => {
    selectState.loading = false;
    selectState.selectedRowKeys = [];
  }, 1000);
};

/**
 * checkBox变化触发
 * @param selectedRowKeys
 */
const handleCheckChange = (selectedRowKeys: Key[]) => {
  console.log("selectedRowKeys changed: ", selectedRowKeys);
  selectState.selectedRowKeys = selectedRowKeys;
};

/**
 * 搜索
 * @param selectedKeys
 * @param confirm
 * @param dataIndex
 */
const handleSearch = (selectedKeys: string[], confirm: () => void, dataIndex: string) => {
  confirm();
  searchState.searchText = selectedKeys[0];
  searchState.searchedColumn = dataIndex;
};

/**
 * 重置筛选
 * @param clearFilters
 */
const handleReset = (clearFilters: ({ confirm }: { confirm: boolean }) => void) => {
  clearFilters({ confirm: true });
  searchState.searchText = "";
};

/**
 * 表格分页、排序、筛选变化时触发
 * @param pag
 * @param filters
 * @param sorter
 */
const handleTableChange = async (pag: any, filters: any, sorter: any) => {
  console.log(pag, filters, sorter);
  if (pag.current !== pagination.current) {
    await getArticlesList({
      page: pag.current,
      limit: pag.pageSize,
      orderBy: "",
    });
  }
};

/**
 * 获取分类列表
 * @returns
 */
const getCatelist = async () => {
  const res = await getCate();
  if ((res.code === 200, Array.isArray(res.data))) {
    const cateMap = res.data.map((item: any) => ({
      text: item.category_name,
      value: item.category_id,
    }));
    Object.assign(cateFilter, cateMap);
    Object.assign(stateEdit, { cateInfo: cateMap });
  }
};

/**
 * 获取标签列表
 * @returns
 */
const getTaglist = async () => {
  const res = await getTag();
  if ((res.code === 200, Array.isArray(res.data))) {
    const tagMap = res.data.map((item: any) => ({
      text: item.tag_name,
      value: item.tag_id,
    }));
    Object.assign(tagFilter, tagMap);
    Object.assign(stateEdit, { tagInfo: tagMap });
  }
};

/**
 * 获取文章列表
 * @param params
 * @returns
 */
const getArticlesList = async (params: BlogList) => {
  // dataSource.length = 0
  loading.value = true;
  await getArticles(params).then((res) => {
    if (res.code === 200) {
      const data = res.data;
      dataSource.push(...data.list.map((item: any) => ({
        id: item.article_id,
        title: item.article_title,
        content: item.article_content,
        html: item.article_html,
        top: item.article_top,
        like: item.article_like_count,
        read: item.article_read_count,
        comment: item.article_comment_count,
        summary: item.article_summary,
        createTime: item.article_create_time,
        updateTime: item.article_update_time,
        cate: item.category.category_name,
        cateId: item.category.category_id,
        tag: item.tag.tag_name,
        tagId: item.tag.tag_id,
        cover: item.article_cover,
        visible: false, // 是否显示封面图
        error: false, // 封面图加载错误
      })));
      // Object.assign(
      //   dataSource,
      //   data.list.map((item: any) => ({
      //     id: item.article_id,
      //     title: item.article_title,
      //     content: item.article_content,
      //     html: item.article_html,
      //     top: item.article_top,
      //     like: item.article_like_count,
      //     read: item.article_read_count,
      //     comment: item.article_comment_count,
      //     summary: item.article_summary,
      //     createTime: item.article_create_time,
      //     updateTime: item.article_update_time,
      //     cate: item.category.category_name,
      //     cateId: item.category.category_id,
      //     tag: item.tag.tag_name,
      //     tagId: item.tag.tag_id,
      //     cover: item.article_cover,
      //     visible: false, // 是否显示封面图
      //     error: false, // 封面图加载错误
      //   }))
      // );
      Object.assign(pagination, {
        total: data.total,
        current: data.page,
        pageSize: data.limit,
      });
    }
  });
  setTimeout(() => {
    loading.value = false;
  }, 500);
};

onMounted(async () => {
  await getArticlesList({ page: 1, limit: 12, orderBy: "" });
  await getCatelist();
  await getTaglist();
});
</script>

<style lang="scss">
@import "@/styles/md-editor.min";

.ant-modal-mask {
  backdrop-filter: blur(8px);
}

.ant-modal-preview {
  scroll-behavior: smooth;
}

.ant-modal-editor {
  scroll-behavior: smooth;

  .ant-modal {
    max-width: 100%;
    top: 0;
    padding-bottom: 0;
    margin: 0;
  }

  .ant-modal-content {
    display: flex;
    flex-direction: column;
    height: calc(100vh);
  }

  .ant-modal-body {
    flex: 1;
  }

  .md-editor {
    height: calc(100vh - 20px);
  }
}

.highlight {
  background-color: #ffc069;
  padding: 0px;
}
</style>
