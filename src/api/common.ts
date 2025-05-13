import request from "../utils/request";
import store from "../store";
import type { UserInfo } from "@/store/types";

/**
 * `blob`或者`file`转读取路径
 * @param target 目标对象 
 */
function blobOrFileToUrl(target: File | Blob) {
  let url = "";
  if (window.URL) {
    url = window.URL.createObjectURL(target);
  } else if (window.webkitURL) {
    url = window.webkitURL.createObjectURL(target);
  }
  return url;
}

/**
 * 获取文章分类
 * @returns
 */
export function getCategory() {
  return request("GET", "/api/category/getCategory");
}

/**
 * 发布文章
 * @param params 文章信息
 * @returns
 */
export function addArticles(params: any) {
  return request("POST", "/api/article/addArticles", params);
}

/**
 * 上传图片
 * @param formData 图片`FormData`
 */
export function uploadImage(formData: FormData) {
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
  return request("POST", "/api/minio/uploadImage", formData);
}

/**
 * 删除图片
 * @param images images: string[ ] 图片地址
 */
export function deleteImage(images: string[]) {
  return request("DELETE", "/api/minio/delImage", { images });
}

/**
 * 获取天气预报数据
 * @param city 城市名
 */
export function getWeather(city: string) {
  return request("GET", "/free/day", {
    appid: "56761788",
    appsecret: "ti3hP8y9",
    city: encodeURIComponent(city)
  },
    {
      headers: {
        // TODO: 天气预报的接口不可以携带 请求头 authorization 字段，所以这里清空
        authorization: ""
      }
    })
}

/**
 * 登录
 * @param params 登录信息
 */
export async function login(params: { account: string, password: string }) {
  // 模拟登录
  return new Promise<Api.Result>(function (resolve) {
    const info: UserInfo = {
      id: Math.random().toString(36).substr(10),
      type: "",
      name: "",
      avatar: "",
      token: Math.random().toString(36).substr(2),
      account: params.account,
      password: params.password
    }
    setTimeout(() => {
      switch (params.account) {
        case "admin":
          info.type = 0;
          info.name = "超级管理员";
          info.avatar = "https://p3-passport.byteacctimg.com/img/user-avatar/6332ece850859ade07f7e6a1394f7c34~300x300.image";
          store.user.update(info);
          resolve({ code: 1, msg: "ok", data: info });
          break;

        case "normal":
          info.type = 1;
          info.name = "普通成员";
          store.user.update(info);
          resolve({ code: 1, msg: "ok", data: info });
          break;

        default:
          resolve({ code: -1, msg: "账户不存在", data: null });
          break;
      }
    }, 600);
  })

  // const res = await request("POST", "/login", params)
  // if (res.code === 1) {
  //   // 录成功后缓存用户信息
  //   store.user.update(res.data);
  // }
  // return res;
}
