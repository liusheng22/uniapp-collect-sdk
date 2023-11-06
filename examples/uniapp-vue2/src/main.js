// import { CollectLogs } from 'uni-collect-ts'
import Vue from 'vue'
import App from './App'
import { collectLogs } from './pages/test/logs'
import './uni.promisify.adaptor'
import customButton from './pages/components/custom-button.vue'

Vue.config.productionTip = false

App.mpType = 'app'

// 注册全局组件
Vue.component('custom-button', customButton)

// const collectLogs = new CollectLogs(Vue)
Vue.prototype.$collectLogs = collectLogs
collectLogs.init({
  platform: 'test-platform',
  uniqueId: 'test123',
  isShowLog: false,
  isOnLifecycle: false,
  isTraceRoute: true,
  isTraceNetwork: true,
  isTraceMemory: true,
  isOnTapEvent: true,
  isOnCaptureScreen: true
})

// 读取pages.json页面
// // eslint-disable-next-line import/order, no-useless-escape
// import pages from 'uni-pages?{\"type\":\"style\"}'
// console.log('🚀 ~ file: main.js:25 ~ pages:', pages)

const app = new Vue({
  ...App
})
app.$mount()
