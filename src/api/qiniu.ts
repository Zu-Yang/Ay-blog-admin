import request from "../utils/request";
import * as qiniu from 'qiniu-js';
import { useQiniu } from '@/store/Qiniu';
const qiniuStore = useQiniu();

/**
 * 获取七牛云上传token
 * @param key 文件名
 * @returns token 上传凭证
 */
export const getQiniuConfig = (key = "") => {
  return request("GET", "/api/qiniu/token", { key });
}

/**
 * 七牛云上`js`传逻辑
 * @param file 文件
 * @param putExtra 上传额外参数
 * @returns Promise<{url: string}> 包含上传成功后的文件名称和可访问URL
 */
export const uploadToQiniu = (file: any, metadata: any): Promise<{ url: string }> => {
  return new Promise((resolve, reject) => {
    const path = qiniuStore.dir.split("/").slice(1).join("/")
    const key = `${path}${file.name}` // 上传文件路径/名称
    getQiniuConfig(key)
      .then(res => {
        if (res.code === 200) {
          const token = res.data.token;
          const config = {
            useCdnDomain: false,
            region: qiniu.region.z2
          };

          // 设置上传参数模板
          const putExtra = {
            fname: file.name,
            mimeType: file.type,
            metadata: {
              'x-qn-meta-author': metadata.author,
              'x-qn-meta-name': metadata.name,
              'x-qn-meta-tag': metadata.tag,
              'x-qn-meta-color': metadata.color,
              'x-qn-meta-description': metadata.description,
              'x-qn-meta-width': metadata.width,
              'x-qn-meta-height': metadata.height
            }
          };

          const observable = qiniu.upload(file.originFileObj, key, token, putExtra, config);
          observable.subscribe({
            next() { },
            error(error: any) {
              reject({ response: error.data.error });
            },
            async complete(res: any) {
              const publicUrl = `${import.meta.env.VITE_QINIU_BASE_PATH}/${res.key}`;
              // 图片处理
              // const imgLink = qiniu.imageMogr2({
              //   quality: 60,    // 图片质量
              //   blur: 10,       // 高斯模糊
              // }, key, import.meta.env.VITE_QINIU_BASE_PATH);
              // console.log("imageMogr2 处理后图片URL:", imgLink);
              // resolve({url: `${publicUrl}?${imgLink}` });

              resolve({ url: publicUrl });
            }
          });
        } else {
          reject({ file, error: new Error('获取七牛云配置失败') });
        }
      })
      .catch(err => {
        reject({ file, error: err });
      });
  });
};

/**
 * 获取图片list
*/
export const getQiniuList = () => {
  return request("GET", "/api/qiniu/list");
}