// import { CollectLogs } from 'uni-collect-ts'
import Vue from 'vue'
import App from './App'
// import customButton from './pages/components/custom-button.vue'
import testComponent from './components/test-component/test-component.vue'
import { collectLogs } from './pages/test/logs'
import './uni.promisify.adaptor'

Vue.config.productionTip = false

App.mpType = 'app'

// 注册全局组件
Vue.component('test-component', testComponent)
// Vue.component('custom-button', customButton)

// const collectLogs = new CollectLogs(Vue)
Vue.prototype.$collectLogs = collectLogs
collectLogs.init({
  sourcePlatform: 'test-platform',
  uniqueId: 'test123',
  isShowLog: false,
  isOnAppLifecycle: true,
  isOnPageLifecycle: true,
  isTraceNetwork: true,
  isTraceMemory: true,
  isOnTapEvent: true,
  isOnCaptureScreen: true
})

const app = new Vue({
  ...App
})
app.$mount()
