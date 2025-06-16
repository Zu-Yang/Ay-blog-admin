import { defineStore } from 'pinia'

export const useArticle = defineStore('article', {
  state: () => {
    return {
      modalType: "", // edit or create
      showEdit: false,
      modifiedData: <any>{},
    }
  }
})