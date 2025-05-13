/**
 * 项目配置模块
 */
const config = (function () {
  /** 当前环境 */
  const env = import.meta.env.MODE as 'development' | 'test' | 'production';

  /** 当前项目运行地址 */
  const url = location.origin;

  /** 请求域名 */
  const requestUrl = import.meta.env.VITE_API_URL || '';

  return {
    /** 请求超时毫秒 */
    get requestTimeout() {
      return import.meta.env.VITE_REQUEST_TIMEOUT || 8000;
    },
    /** `api`请求域名 */
    get apiUrl() {
      return requestUrl;
    },
    /** 是否开发环境 */
    get isDev() {
      return env === 'development';
    },
    /** 当前项目运行地址 */
    get webUrl() {
      return url;
    },
  }
})();

export default config;