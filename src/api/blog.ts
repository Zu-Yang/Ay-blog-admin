import request from "../utils/request";
import type { Article, getArticle, getComment, replyComment, delComment, careaComment } from "./blogType.d.ts";

/**
 * 删除评论
 * @param params 删除评论所需参数
 * @returns
 */
export function delComment(params: delComment) {
  return request("DELETE", "/api/comment/delete", params);
}

/**
 * 新增评论
 * @param params 新增评论所需参数
 * @returns
 */
export function addComment(params: replyComment | careaComment) {
  return request("POST", "/api/comment/add", params);
}

/**
 * 获取评论
 * @param params 获取评论所需参数
 * @returns
 */
export function getComment(params: getComment) {
  return request("GET", "/api/comment/list", params);
}

/**
 * 获取分类
 * @returns
 */
export function getCate() {
  return request("GET", "/api/category/getCategory");
}

/**
 * 获取标签
 * @returns
 */
export function getTag() {
  return request("GET", "/api/tag/getTag");
}

/**
 * 发布文章
 * @param params 文章发布所需参数
 * @returns
 */
export function addArticles(params: Article) {
  return request("POST", "/api/article/addArticles", params);
}

/**
 * 更新文章
 * @param params 文章更新所需参数
 * @returns
 */
export function updateArticle(params: Article) {
  return request("PATCH", "/api/article/updateArticle", params);
}

/**
 * 获取列表
 * @param params 获取文章所需参数
 * @returns
 */
export function getArticles(params: getArticle) {
  return request("GET", "/api/article/list", params);
}

/**
 * 获取IP定位
 * @param ip ip地址
 * @returns Promise<Api.Result>
 */
export function getLocal(ip: string) {
  return request("GET", `/api/local/getLocal?ip=${ip}`);
}

/**
 * 上传图片
 * @param formData 图片`FormData`
 */
export function uploadImage(formData: FormData) {
  return request("POST", "/api/minio/uploadImage", formData);
  // 模拟上传
  // const file = formData.get("file") as File;
  // return new Promise<Api.Result<{ url: string }>>(function (resolve) {
  //   setTimeout(function () {
  //     resolve({
  //       code: 1,
  //       data: {
  //         url: blobOrFileToUrl(file)
  //       },
  //       msg: "上传成功"
  //     })
  //   }, 500);
  // });
}

/**
 * 删除图片
 * @param {string[]} images 图片地址
 */
export function deleteImage(images: string[]) {
  return request("DELETE", "/api/minio/delImage", { images });
}

/**
 * 删除文章
 * @param {number} id 文章id
 */
export function deleteArticle(id: number) {
  return request("DELETE", "/api/article/deleteArticle", { id });
}