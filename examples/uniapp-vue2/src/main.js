import Vue from 'vue'
import App from './App'
import { collectLogs } from './pages/test/logs'

import './uni.promisify.adaptor'

Vue.config.productionTip = false

App.mpType = 'app'

collectLogs.init({
  sourcePlatform: 'test_platform',
  uniqueId: 'test_uniqueId',
  project: 'test_project',
  serverUrl: 'https://example.com',

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
  isOnPageLifecycle: true,
  isOnTapEvent: true
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
