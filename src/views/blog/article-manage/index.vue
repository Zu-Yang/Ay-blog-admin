<template>
  <div>
    <a-space :size="8" style="margin-bottom: 14px;">
      <a-popconfirm :open="hasSelected" title="Are you sure delete this article?" :showCancel="false" ok-text="Yes"
        cancel-text="No" @confirm="batchDelete" @cancel="">
        <a-button type="primary" danger :disabled="!hasSelected" :loading="selectState.loading">
          批量删除
          <span v-if="hasSelected">
            {{ `&nbsp;${selectState.selectedRowKeys.length} 篇文章` }}
          </span>
        </a-button>
      </a-popconfirm>
      <a-button type="primary" @click="handleCreate"> 新增文章 </a-button>
      <!-- <a-input addon-before="评论区LIMIT" :maxlength="3" v-model:value="stateComment.limit" placeholder="搜索数量" /> -->
    </a-space>
    <a-table :row-selection="{
      selectedRowKeys: selectState.selectedRowKeys,
      onChange: handleCheckChange,
    }" sticky :row-key="(record: TableDataType) => record.id" :pagination="pagination" :columns="columns"
      :data-source="dataSource" :loading="loading" :scroll="{ x: 1500, y: 600 }" @expand="handleExpand"
      :expand-column-width="50" @change="handleTableChange"
      @resizeColumn="(w: number, col: TableColumnType) => col.width = w">
      <!-- 自定义head内容 -->
      <template #headerCell="{ column }"> </template>
      <!-- 展开列标题 -->
      <template #expandColumnTitle>
        <span>评论区</span>
      </template>

      <!-- 展开内容 -->
      <template #expandedRowRender="{ record }">
        <!-- 评论区 -->
        <div>
          <div :style="{ textAlign: 'center' }">
            <a-button @click="record.showCommentBox = !record.showCommentBox">
              {{ record.showCommentBox ? "取消评论" : "评论一下" }}
            </a-button>
          </div>
          <div v-if="record.showCommentBox" class="reply-textarea">
            <a-comment>
              <template #content>
                <a-form-item>
                  <a-textarea v-model:value="record.commentContent" :rows="4" @change="handleChange()"
                    :id="`comment_textarea_${record.id}`" placeholder="来聊聊天~" :maxlength="500" />
                </a-form-item>
                <a-form-item>
                  <a-button html-type="submit" :loading="submitting" type="primary" @click="handleComment(record)">
                    发送评论
                  </a-button>
                </a-form-item>
              </template>
            </a-comment>
          </div>
        </div>
        <a-list class="comment-list" :header="`${record.oneLevelCount ? record.oneLevelCount : 0} 条评论`"
          item-layout="horizontal" :data-source="record.commentList">
          <template #renderItem="{ item, index }">
            <a-list-item>
              <a-comment class="w-full">
                <template #avatar>
                  <img :src="item.user_avatar" />
                </template>
                <template #author>
                  <a :href="item.visitor_info.user_jump_url" target="_blank">{{
                    item.visitor_info.nick_name
                  }}</a>
                </template>
                <template #actions>
                  <a-button class="flex items-center" size="small" type="link" @click="clickReply(item)">
                    <template #icon>
                      <EditOutlined />
                    </template>
                    {{ item.showReply ? `取消回复` : "回复" }}
                  </a-button>
                  <a-popconfirm :showCancel="false" title="确定删除此评论?" ok-text="Yes" cancel-text="No"
                    @confirm="handleDeleteComment(record.id, item, record.commentList)" @cancel="">
                    <a-button class="flex items-center" size="small" type="link" danger>
                      <template #icon>
                        <DeleteOutlined />
                      </template>
                      删除
                    </a-button>
                  </a-popconfirm>
                </template>
                <template #content>
                  <div class="inline" v-html="item.isExpand
                    ? contentHandler(item.content, true)
                    : item.processedContent
                    "></div>
                  <a class="ml-2 inline-flex items-center" v-if="item.showExpand"
                    @click="item.isExpand = !item.isExpand">
                    <DownOutlined class="mr-1" v-if="!item.isExpand" />
                    <UpOutlined class="mr-1" v-if="item.isExpand" />
                    {{ item.isExpand ? "收起" : `展开` }}
                  </a>
                </template>
                <template #datetime>
                  <a-tooltip :title="item.datetime.format('YYYY-MM-DD HH:mm:ss')">
                    <span :key="item.datetime.fromNow()">{{
                      item.datetime.fromNow()
                    }}</span>
                  </a-tooltip>
                </template>
                <!-- 回复框 -->
                <div v-if="item.showReply" class="reply-textarea">
                  <a-comment>
                    <template #content>
                      <a-form-item>
                        <a-textarea v-model:value="item.replyContent" :rows="4" :id="`reply_textarea_${item.id}`"
                          :placeholder="`@${item.visitor_info.nick_name}`" :maxlength="500" @change="handleChange()" />
                      </a-form-item>
                      <a-form-item>
                        <a-button html-type="submit" :loading="submitting" type="primary"
                          @click="handleReply(item, record.commentList[index].replys)">
                          发送评论
                        </a-button>
                      </a-form-item>
                    </template>
                  </a-comment>
                </div>
                <!-- 回复列表 -->
                <a-list v-if="item.isExpandReply && item.replys.length" class="reply-list" item-layout="horizontal"
                  :data-source="item.replys">
                  <template #renderItem="{ item }">
                    <a-list-item>
                      <a-comment>
                        <template #avatar>
                          <img :src="item.user_avatar" />
                        </template>
                        <template #author>
                          <div class="flex items-center">
                            <a :href="item.visitor_info.user_jump_url" target="_blank">
                              {{ item.visitor_info.nick_name }}
                            </a>
                            <CaretRightFilled />
                            <span v-if="
                              !findNickName(
                                item.reply_id,
                                record.commentList[index].replys
                              )
                            ">
                              评论已被删除
                            </span>
                            <a v-else :href="item.reply_info.user_jump_url" target="_blank">
                              {{ item.reply_info.nick_name }}
                            </a>
                          </div>
                        </template>
                        <template #actions>
                          <a-button class="flex items-center" size="small" type="link" @click="clickReply(item)">
                            <template #icon>
                              <EditOutlined />
                            </template>
                            {{ item.showReply ? `取消回复` : "回复" }}
                          </a-button>
                          <a-popconfirm :showCancel="false" title="确定删除此评论?" ok-text="Yes" cancel-text="No" @confirm="
                            handleDeleteComment(
                              record.id,
                              item,
                              record.commentList[index].replys
                            )
                            " @cancel="">
                            <a-button class="flex items-center" size="small" type="link" danger>
                              <template #icon>
                                <DeleteOutlined />
                              </template>
                              删除
                            </a-button>
                          </a-popconfirm>
                        </template>
                        <template #content>
                          <div class="inline" v-html="item.isExpand
                            ? contentHandler(item.content, true)
                            : item.processedContent
                            "></div>
                          <a class="ml-2 inline-flex items-center" v-if="item.showExpand"
                            @click="item.isExpand = !item.isExpand">
                            <DownOutlined class="mr-1" v-if="!item.isExpand" />
                            <UpOutlined class="mr-1" v-if="item.isExpand" />
                            {{ item.isExpand ? "收起" : `展开` }}
                          </a>
                        </template>
                        <template #datetime>
                          <a-tooltip :title="item.datetime.format('YYYY-MM-DD HH:mm:ss')">
                            <span :key="item.datetime.fromNow()">{{
                              item.datetime.fromNow()
                            }}</span>
                          </a-tooltip>
                          <span v-if="item.user_email == authorEmail" class="pl-2">作者回复</span>
                        </template>
                        <!-- 回复框 -->
                        <div v-if="item.showReply" class="reply-textarea">
                          <a-comment>
                            <template #content>
                              <a-form-item>
                                <a-textarea v-model:value="item.replyContent" :rows="4" @change="handleChange()"
                                  :id="`reply_textarea_${item.id}`" :placeholder="`@${item.nick_name}`"
                                  :maxlength="500" />
                              </a-form-item>
                              <a-form-item>
                                <a-button html-type="submit" :loading="submitting" type="primary" @click="
                                  handleReply(item, record.commentList[index].replys)
                                  ">
                                  发送评论
                                </a-button>
                              </a-form-item>
                            </template>
                          </a-comment>
                        </div>
                      </a-comment>
                    </a-list-item>
                  </template>
                </a-list>
                <!-- 展开回复按钮 -->
                <a class="inline-flex items-center" v-if="item.replys.length"
                  @click="item.isExpandReply = !item.isExpandReply">
                  <DownOutlined class="mr-1" v-if="!item.isExpandReply" />
                  <UpOutlined class="mr-1" v-if="item.isExpandReply" />
                  {{ item.isExpandReply ? "收起回复" : `${item.replys.length}条回复` }}
                </a>
              </a-comment>
            </a-list-item>
          </template>
          <template #loadMore>
            <div v-if="
              Math.ceil(record.oneLevelCount / stateComment.limit) > record.commentPage
            " :style="{
              textAlign: 'center',
              marginTop: '12px',
              height: '32px',
              lineHeight: '32px',
            }">
              <a-button :loading="loadMore" @click="handleMore(record)">
                加载更多
              </a-button>
            </div>
          </template>
        </a-list>
      </template>
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
          <a-image :preview="{ visible: false }" :src="text[0]"
            @click="!record.coverError && (record.showCoverProview = true)" placeholder
            fallback="data:image/png;base64,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"
            @error="record.coverError = true" :alt="text[0]" />
          <div v-if="!record.coverError" style="display: none">
            <a-image-preview-group :preview="{
              visible: record.showCoverProview,
              onVisibleChange: (vis: boolean) => (record.showCoverProview = vis),
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
            <a-popconfirm :showCancel="false" placement="bottom" title="删除这篇文章吗?" ok-text="确定" cancel-text="取消"
              @confirm="handleDelete(record.id)">
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
  DeleteOutlined,
  ArrowsAltOutlined,
  ShrinkOutlined,
  DownOutlined,
  UpOutlined,
  EditOutlined,
  CaretRightFilled,
} from "@ant-design/icons-vue";
import {
  getArticles,
  getCate,
  getTag,
  deleteArticle,
  getComment,
  delComment,
  addComment,
  getLocal,
} from "@/api/blog";
import type {
  getArticle,
  TableDataType,
  replyComment,
  careaComment,
} from "@/api/blogType";
import { MdCatalog, MdPreview } from "md-editor-v3";
import { MarkdownEditor } from "@/components/MdEditor";
import { useArticle } from "@/store/Article";
import { message } from "@/utils/message";
import { contentHandler, useDecodeEmoji, useEncodeEmoji } from "@/utils/comment";
import { v4 } from "uuid";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import { getIP } from "@/utils/ip";

const store = useArticle();

const authorEmail = "3108521253@qq.com";
const editorId = ref<string>("md-editor");
const showPreview = ref<boolean>(false);
const statePreview = reactive({
  id: 1,
  title: "",
  summary: "",
  content: "",
});
const stateEdit = reactive({
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
});
const stateComment = reactive({
  page: 1,
  limit: 10,
  biz_type: "article", // 业务类型
  biz_id: null, // 业务类型的id
});
const stateUserInfo = reactive({
  ip: "",
  email: "1656053797@qq.com",
  avatar: "",
  nick_name: "作者",
  jump_url: "https://baidu.com/",
});
const loading = ref(false);
const loadMore = ref(false);
const submitting = ref(false);
const searchInput = ref();
const isMdPreviewCatalog = ref(false);
const dataSource = reactive<TableDataType[]>([]);
const searchState = reactive({ searchText: "", searchedColumn: "" });
const cateFilter = reactive<{ text: string; value: number }[]>([]);
const tagFilter = reactive<{ text: string; value: number }[]>([]);
const pagination = reactive({ total: 0, current: 1, pageSize: 12 });
const columns: TableColumnType<TableDataType>[] = [
  {
    title: "ID",
    dataIndex: "id",
    fixed: "left",
    width: 50,
    ellipsis: true,
    sorter: {
      compare: (a, b) => a.like - b.like,
      multiple: 0, // 排序权重
    },
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
    onFilterDropdownOpenChange: visible => {
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
    width: 100,
    ellipsis: true,
    sorter: {
      compare: (a, b) => a.createTime - b.createTime,
      multiple: 2, // 排序权重
    },
  },
  {
    title: "更新时间",
    dataIndex: "updateTime",
    width: 100,
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
watch(
  () => store.modifiedData,
  (newVal, oldVal) => {
    if (Object.keys(store.modifiedData).length !== 0) {
      if (store.modalType === "edit") {
        // acc: 累加器，初始值为空数组
        // item: 当前遍历的数组元素
        // index: 当前元素的索引
        dataSource.reduce((acc: any, item: TableDataType, index: number) => {
          if (item.id === store.modifiedData.id) {
            Object.assign(dataSource[index], store.modifiedData);
            return;
          }
          return acc; // 返回累加器，继续下一次迭代
        }, []);
      }
      if (store.modalType === "create") {
        dataSource.splice(0, 0, store.modifiedData);
        pagination.total += 1;
      }
      store.$patch({ modalType: "", modifiedData: {} });
    }
  },
  {
    deep: true
  }
);

type Key = number;

const selectState = reactive<{ selectedRowKeys: Key[]; loading: boolean }>({
  selectedRowKeys: [], // Check here to configure the default column
  loading: false,
});
const hasSelected = computed(() => selectState.selectedRowKeys.length > 0);

/**
 * 删除评论
 * @param id 文章id
 * @param comment 当前评论数据
 * @param commentList 当前评论列表
 * @returns Promise<void>
 */
const handleDeleteComment = async (
  id: number,
  comment: any,
  commentList: any[]
): Promise<void> => {
  try {
    const { comment_id, parent_id, biz_id, biz_type } = comment;
    const result = await delComment({ comment_id, parent_id, biz_id, biz_type });

    if (result.code === 200) {
      const index: number = commentList.findIndex(
        (item: any) => item.comment_id === comment_id
      );
      commentList.splice(index, 1);
      message.success("删除成功");
    }
  } catch (error) {
    console.error("删除评论时发生错误:", error);
    message.error("删除评论时发生错误");
  }
};

/**
 * textarea `@change`事件
 * @param content 评论内容
 */
const handleChange = () => { };

/**
 * 点击回复按钮逻辑
 * @param comment 评论数据
 */
const clickReply = async (comment: any) => {
  const { id, showReply } = comment;
  comment.showReply = !showReply;
  nextTick(() => {
    const textarea = document.querySelector(
      `#reply_textarea_${id}`
    ) as HTMLTextAreaElement;
    if (textarea) textarea.focus();
  });
};

/**
 * 点击评论按钮
 */
const handleComment = async (record: any) => {
  const { id } = record;

  if (!record.commentContent) return message.warning("请输入评论内容");

  const params: careaComment = {
    biz_id: id,
    biz_type: stateComment.biz_type,
    user_avatar: stateUserInfo.avatar,
    user_ip: stateUserInfo.ip,
    jump_url: stateUserInfo.jump_url,
    nick_name: stateUserInfo.nick_name,
    user_email: stateUserInfo.email,
    comment_id: v4(),
    content: useEncodeEmoji(record.commentContent),
  };

  try {
    const result = await addComment(params);
    if (result.code === 200) {
      const newComment = commentMap(new Array(result.data));
      record.commentList.unshift(...newComment);
      record.showCommentBox = false;
      record.commentContent = "";
      message.success("评论成功");
    }
  } catch (error) {
    console.error("发送评论时发生错误:", error);
    message.error("发送评论时发生错误");
  }
};

/**
 * 发送回复评论
 * @param comment 评论数据
 */
const handleReply = async (comment: any, replyList: any[]) => {
  const {
    biz_id,
    biz_type,
    comment_id,
    reply_id,
    user_ip,
    user_avatar,
    parent_id,
    id,
    jump_url,
    nick_name,
    replyContent,
    user_email,
    reply_ip,
  } = comment;

  if (!replyContent) return message.warning("请输入评论内容");

  const params: replyComment = {
    biz_id,
    biz_type,
    user_avatar: stateUserInfo.avatar,
    user_ip: stateUserInfo.ip,
    jump_url: stateUserInfo.jump_url,
    nick_name: stateUserInfo.nick_name,
    user_email: stateUserInfo.email,
    comment_id: v4(),
    reply_id: comment_id,
    parent_id: parent_id ? parent_id : comment_id,
    content: useEncodeEmoji(replyContent),
    reply_ip: user_ip,
  };

  try {
    const result = await addComment(params);
    if (result.code === 200) {
      const newComment = commentMap(new Array(result.data));

      if (parent_id && reply_id) {
        // 二级回复
        const index = replyList.findIndex((item: any) => item.id === id);
        replyList.splice(index + 1, 0, ...newComment);
      } else {
        // 一级回复
        replyList.unshift(...newComment);
      }
      comment.showReply = false; // 关闭评论框
      comment.isExpandReply = true; // 打开回复列表
      comment.replyContent = ""; // 清空回复内容
      message.success("评论成功");
    }
  } catch (error) {
    console.error("发送评论时发生错误:", error);
    message.error("发送评论时发生错误");
  }
};

const findNickName = (replyId: string, replyList: any) => {
  let flag = false;
  for (let index = 0; index < replyList.length; index++) {
    const item = replyList[index];
    // 排除对父评论的回复
    if (item.parent_id == item.reply_id) {
      flag = true;
      break; // 必须找到之后退出循环
    } else if (item.comment_id == replyId) {
      flag = true;
      break; // 必须找到之后退出循环
    }
  }
  return flag;
};

/**
 * 内容处理逻辑
 */
const commentMap = (data: Array<any>) => {
  return data.map((item: any) => {
    if (item.replys && item.replys.length > 0) {
      item.replys = commentMap(item.replys);
    }
    return {
      ...item,
      isExpandReply: false, // 是否展开回复列表
      isExpand: false, // 是否展开评论内容
      showReply: false, // 是否显示回复框
      replyContent: "", // 回复内容
      showExpandReply: (item.replys && item.replys.length > 0) || false, // 是否显示"展开回复按钮"
      showExpand: useDecodeEmoji(item.content).length > 200 || false, // 是否显示"展开按钮" 转义后再判断长度
      processedContent: contentHandler(item.content), // 内容处理
      datetime: dayjs(item.created_at).subtract(0, "days"), // 时间处理
    };
  });
};

/**
 * 加载更多评论
 */
const handleMore = async (record: TableDataType) => {
  loadMore.value = true;
  const params = {
    page: record.commentPage + 1,
    limit: stateComment.limit,
    biz_type: stateComment.biz_type,
    biz_id: record.id,
  };
  const result: any = await getComment(params);
  setTimeout(() => {
    if (result.code === 200) {
      record.oneLevelCount = result.oneLevelCount;
      record.commentPage = result.page;
      const temp = commentMap(result.data);
      record.commentList.push(...temp);
    }
    loadMore.value = false;
  }, 200);
};

/**
 * 展开评论
 */
const handleExpand = async (expanded: boolean, record: TableDataType) => {
  if (expanded && record.commentList.length === 0) {
    loading.value = true;
    const params = {
      page: record.commentPage + 1,
      limit: stateComment.limit,
      biz_type: stateComment.biz_type,
      biz_id: record.id,
    };
    const result: any = await getComment(params);
    if (result.code === 200) {
      record.oneLevelCount = result.oneLevelCount;
      record.commentPage = result.page;
      const temp = commentMap(result.data);
      record.commentList.push(...temp);
    }
    loading.value = false;
  }
};

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
    content: useDecodeEmoji(record.content),
  });
  showPreview.value = true;
  initMdPreview();
};

/**
 * 编辑文章
 * @param record
 */
const handleEdit = (record: TableDataType) => {
  editorId.value = `md-edit-${record.id}`;

  Object.assign(stateEdit, {
    id: record.id,
    content: useDecodeEmoji(record.content),
    title: record.title,
    summary: record.summary,
    top: record.top,
    cateId: record.cateId,
    tagId: record.tagId,
    cover: record.cover,
  });

  store.$patch({ showEdit: true, modalType: "edit" });
};

/**
 * 删除文章
 * @param record
 */
const handleDelete = async (id: number) => {
  try {
    loading.value = true;
    await deleteArticle(id).then(res => {
      if (res.code === 200) {
        dataSource.splice(
          dataSource.findIndex((item: any) => item.id === id),
          1
        );
        message.success("删除成功");
        loading.value = false;
      } else {
        message.error(res.msg);
        loading.value = false;
      }
    });
  } catch (error) {
    message.error("删除失败");
  }
};

/**
 * 批量删除
 */
const batchDelete = async () => {
  selectState.loading = true;
  await new Promise(resolve => {
    selectState.selectedRowKeys.forEach(id => {
      handleDelete(id);
    });
    resolve(true);
  });
  selectState.loading = false;
  selectState.selectedRowKeys.length = 0;
};

/**
 * 创建文章
 */
const handleCreate = () => {
  Object.assign(stateEdit, {
    id: null,
    title: "",
    summary: "",
    content: "",
    cateId: null, // 默认值与类型保持一致
    tagId: null, // 默认值与类型保持一致
    top: null, // 默认值与类型保持一致
    cover: "",
  });
  store.$patch({ showEdit: true, modalType: "create" });
};

/**
 * checkBox变化触发
 * @param selectedRowKeys
 */
const handleCheckChange = (selectedRowKeys: Key[]) => {
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
const getArticlesList = async (params: getArticle) => {
  loading.value = true;
  await getArticles(params).then(res => {
    if (res.code === 200) {
      const data = res.data;
      dataSource.length = 0;
      const temp = data.list.map((item: any) => ({
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
        cover: item.article_cover ? JSON.parse(item.article_cover) : [],
        showCoverProview: false, // 是否显示封面图
        coverError: false, // 封面图加载错误
        commentList: [], // 评论列表
        showCommentBox: false, // 打开评论框
        commentContent: "", // 评论内容
        oneLevelCount: 0, // 一级评论数量
        commentPage: 0, // 评论页码
      }));
      dataSource.push(...temp);
      Object.assign(pagination, {
        total: data.total,
        current: data.page,
        pageSize: data.limit,
      });
    }
  });
  setTimeout(() => {
    loading.value = false;
  }, 200);
};

onMounted(async () => {
  await getArticlesList({ page: 1, limit: 12, orderBy: "" });
  await getCatelist();
  await getTaglist();
  getIP(async ip => {
    stateUserInfo.ip = ip;
    // await getLocal(ip);
  });
});
</script>

<style lang="scss">
@import "@/styles/md-editor";

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

.comment-list {
  .ant-comment-content-author-name a {
    color: inherit;
  }

  .ant-comment {
    width: 100%;
  }

  .reply-textarea {
    .ant-comment-inner {
      padding: 0;
    }
  }
}
</style>
