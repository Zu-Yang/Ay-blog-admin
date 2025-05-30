import request from "../utils/request";
import type { BlogUpload, BlogList } from "./blogType.d.ts";

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
 * @param params 文章信息
 * @returns
 */
export function addArticles(params: BlogUpload) {
  return request("POST", "/api/article/addArticles", params);
}
/**
 * 发布文章
 * @param params 文章信息
 * @returns
 */
export function updateArticle(params: BlogUpload) {
  return request("PATCH", "/api/article/updateArticle", params);
}

/**
 * 获取列表
 * @param params 文章信息
 * @returns
 */
export function getArticles(params: BlogList) {
  return request("GET", "/api/article/list", params);
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
 * @param images images: string[ ] 图片地址
 */
export function deleteImage(images: string[]) {
  return request("DELETE", "/api/minio/delImage", { images });
}