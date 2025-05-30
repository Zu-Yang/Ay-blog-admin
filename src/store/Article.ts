import { defineStore } from 'pinia'

export const useArticle = defineStore('article', {
  state: () => {
    return {
      showEdit: false,
      modifiedData: <any>{},
    }
  }
})