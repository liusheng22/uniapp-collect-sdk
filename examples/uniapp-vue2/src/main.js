import { CollectLogs } from 'uni-collect-ts'
import Vue from 'vue'
import App from './App'
import './uni.promisify.adaptor'

Vue.config.productionTip = false

App.mpType = 'app'

const collectLogs = new CollectLogs(Vue)
collectLogs.init({
  platform: 'test-platform',
  uniqueId: 'test123',
  isShowLog: false,
  isOnLifecycle: true,
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
