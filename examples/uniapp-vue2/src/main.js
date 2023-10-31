import { Logs } from 'uni-collect-ts'
import Vue from 'vue'
import App from './App'
import './uni.promisify.adaptor'

Vue.config.productionTip = false

App.mpType = 'app'

const uniTracker = new Logs('https://fastmock.site/#/project/6345ad1b8161c2b06ef04f23db6c1b1e')
uniTracker.init({
  platform: 'test-platform',
  uniqueId: 'test123',
  isShowLog: true,
  isOnLifecycle: true,
  isTraceRoute: true,
  isTraceNetwork: true,
  isTraceMemory: true,
  isOnTapEvent: true,
  isOnCaptureScreen: true
})

const app = new Vue({
  ...App
})
app.$mount()
