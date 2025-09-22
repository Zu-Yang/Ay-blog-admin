/** 删除评论参数 */
export interface delComment {
  /** 业务id */
  biz_id: number;
  /** 业务场景 */
  biz_type: string;
  /** 评论id */
  comment_id: string;
  /** 父评论id */
  parent_id: string;
};



/** 新增评论参数 */
export interface careaComment {
  /** 用户昵称 */
  nick_name: string,
  /** 用户邮箱 */
  user_email: string,
  /** 用户网站 */
  user_avatar: string,
  /** 用户ip */
  user_ip: string,
  /** 文章id */
  jump_url: string,
  /** 业务类型 */
  biz_type: string,
  /** 业务id */
  biz_id: number,
  /** 评论id */
  comment_id: string,
  /** 评论内容 */
  content: string,
}

/** 回复评论参数 */
export interface replyComment {
  /** 用户昵称 */
  nick_name: string,
  /** 用户邮箱 */
  user_email: string,
  /** 用户网站 */
  user_avatar: string,
  /** 用户ip */
  user_ip: string,
  /** 文章id */
  jump_url: string,
  /** 业务类型 */
  biz_type: string,
  /** 业务id */
  biz_id: number,
  /** 评论id */
  comment_id: string,
  /** 回复id */
  reply_id?: string,
  /** 回复ip */
  reply_ip: string,
  /** 父评论id */
  parent_id: string,
  /** 评论内容 */
  content: string,
}

/** 获取评论参数 */
export interface getComment {
  /** 业务id */
  biz_id: number;
  /** 业务场景 */
  biz_type: string;
  /** 页码 */
  page: number;
  /** 每页数量 */
  limit: number;
};

/** 博文发布参数 */
export interface Article {
  /** 文章ID */
  article_id?: number
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
export interface getArticle {
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
  cover: string
  /** 评论列表 */
  commentList: any[]
  /** 父评论数 */
  oneLevelCount: number
  /** 评论页码 */
  commentPage: number
}

/** 创建博文参数 */
export interface CreateBlog {
  /** 文章ID */
  id?: number
  /** 标题 */
  title: string
  /** 内容 */
  content: string
  /** html */
  html: string
  /** 图片 */
  cover: string
  /** 摘要 */
  summary: string
  /** 置顶 */
  top: string
  /** 标签 */
  tagId: string
  /** 分类 */
  cateId: string
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
  cover: string
  /** 摘要 */
  summary: string
  /** 置顶 */
  top: string
  /** 标签 */
  tagId: string
  /** 分类 */
  cateId: string
}
