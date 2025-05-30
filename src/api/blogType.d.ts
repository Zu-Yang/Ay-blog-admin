/** 博文发布参数 */
export interface BlogUpload {
  /** 文章ID */
  article_id: number
  /** 标题 */
  article_title: string
  /** 内容 */
  article_content: string
  /** 图片 */
  article_cover: string[]
  /** 摘要 */
  article_summary: string
  /** 置顶 */
  article_top: number
  /** 标签 */
  tag_id: number
  /** 分类 */
  category_id: number
}

/** 获取博文分页与排序参数 */
export interface BlogList {
  /** 页码 */
  page: number
  /** 每页数量 */
  limit: number
  /** 排序 */
  orderBy?: string
}

/** 博客文章表格数据类型 */
export interface TableDataType {
  /** 文章ID */
  id: number
  /** 文章标题 */
  title: string
  /** 文章内容 */
  content: string
  /** html内容 */
  html: string
  /** 是否置顶 */
  top: number
  /** 点赞数 */
  like: number
  /** 阅读量 */
  read: number
  /** 评论数 */
  comment: number
  /** 文章摘要 */
  summary: string
  /** 创建时间 */
  createTime: number
  /** 更新时间 */
  updateTime: number
  /** 分类名称 */
  cate: number
  /** 分类ID */
  cateId: number
  /** 标签名称 */
  tag: number
  /** 标签ID */
  tagId: number
  /** 封面图 */
  cover: string[]
}

/** 更新博文参数 */
export interface UpdateBlog {
  /** 文章ID */
  id: number
  /** 标题 */
  title: string
  /** 内容 */
  content: string
  /** html */
  html: string
  /** 图片 */
  cover: string[]
  /** 摘要 */
  summary: string
  /** 置顶 */
  top: string
  /** 标签 */
  tagId: string
  /** 分类 */
  cateId: string
}
