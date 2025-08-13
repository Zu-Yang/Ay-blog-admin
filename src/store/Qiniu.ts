import { defineStore } from 'pinia'

export const useQiniu = defineStore('qiniu', {
  state: () => {
    return {
      dir: "", // 七牛云对象储存路径
    }
  }
})