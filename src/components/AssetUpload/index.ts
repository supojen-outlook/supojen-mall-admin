import type { App, Plugin } from 'vue'
import AssetUploadComponent from './AssetUpload.vue'

/**
 * 封裝為 Vue 插件，支援全域註冊
 * 使用方式：app.use(AssetUpload)
 */
const AssetUpload = {
  ...AssetUploadComponent,
  install: (app: App) => {
    app.component('AssetUpload', AssetUploadComponent)
  }
} as unknown as Plugin & typeof AssetUploadComponent

export default AssetUpload
export { AssetUpload }
