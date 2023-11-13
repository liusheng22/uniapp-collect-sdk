import Vue from 'vue'
import App from './App'
// import customButton from './pages/components/custom-button.vue'
// import testComponent from './components/test-component/test-component.vue'
import { collectLogs } from './pages/test/logs'

import './uni.promisify.adaptor'

Vue.config.productionTip = false

App.mpType = 'app'

// 注册全局组件
// Vue.component('test-component', testComponent)
// Vue.component('custom-button', customButton)

Vue.prototype.$collectLogs = collectLogs
// eslint-disable-next-line
uni.$on('collectLogs', (data) => {
  collectLogs.reportLog({
    ...data
  })
})
collectLogs.init({
  sourcePlatform: 'test-platform',
  uniqueId: 'test123',
  project: 'product_basic',
  serverUrl: 'https://secretdata.test.wangxiaobao.com',

  customFields: {
    role: {
      value: 'role1111',
      key: 'role'
    },
    a: {
      value: '',
      key: 'a'
    },
    b: {
      value: '',
      key: 'b'
    },
    c: {
      value: '',
      key: 'b333'
    },
    d: {
      value: '',
      key222: 'wrw'
    }
  },

  isShowLog: true,
  isOnAppLifecycle: false,
  isOnPageLifecycle: true,
  isTraceNetwork: false,
  isTraceMemory: false,
  isOnTapEvent: true,
  isOnCaptureScreen: false
})

// collectLogs.customReport({
//   project: 'product_basic1',
//   eventType: 'test'
// }, {
//   test111: 'test1111'
// })

const app = new Vue({
  ...App
})
app.$mount()
