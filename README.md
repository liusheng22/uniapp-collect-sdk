# 基于uniapp项目的埋点SDK

### 平台/框架的兼容性
|  | vue2 | vue3 |
| :----: | :----: | :----: |
| app | ✅ | ❌ |
| 小程序 | ✅ | ❌ |
| H5 | ❌ | ❌ |

### 接入方式
> 安装埋点SDK
```shell
npm install wxb-uniapp-collect-sdk
```

> 安装埋点SDK的loader
```shell
npm install wxb-uniapp-inset-loader
```

> 配置`vue.config.js`文件
```javascript
const path = require('path')
const insetLoader = path.resolve(__dirname, '../node_modules/wxb-uniapp-inset-loader/src/index.js')
module.exports = {
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.vue$/,
          use: {
            loader: insetLoader,
            options: {
              VUE_APP_PLATFORMS: ['app-plus'],
              wxbCollectLogs: true
            }
          }
        }
      ]
    }
  }
}
```

> 实例化SDK，需要传入Vue实例
```javascript
// file utils/logs.js
import Vue from 'vue'
import { CollectLogs } from 'wxb-uniapp-collect-sdk'

export const collectLogs = new CollectLogs(Vue)
```

> 初始化SDK
```javascript
// file main.js/xxx.vue
import { collectLogs } from '@/utils/logs.js'
collectLogs.init({
  sourcePlatform: '', // 平台类型
  uniqueId: '', // 用户唯一标识
  project: '', // 项目名称
  serverUrl: 'https://secretdata.test.wangxiaobao.com',
  customFields: { // 自定义字段，解释见下方
    role: {
      value: '置业顾问',
    },
    tel: {
      key: 'phone'
    },
    userInfo: {
      key: 'userInfo'
    },
  },
  isShowLog: false, // 是否显示console输出
  isOnPageLifecycle: true, // 是否监听页面生命周期
  isOnTapEvent: true // 是否开启点击事件监听
})
```

> `customFields`字段解释
- role - 自定义字段名称
  - 用于上报时，作为字段名称
  - 如果获取的数据为对象，则忽略该字段
- key - 自定义字段key值，用于 uni.getStorageSync(key) 获取动态字段数据
  - 如果获取的数据为对象，则会将该对象的所有字段作为自定义字段上报
  - 如果获取的数据为非数组，则会将该数据作为自定义字段上报
- value - 自定义字段值
  - 直接填写值，会将该值作为自定义字段上报
  - 取值以key为更高优先级，如果key存在，则会以key为准，否则会以value为准

---

### SDK暴露的函数
> `init` 用于初始化SDK
```javascript
this.$collectLogs.init({
  ...
})
```

> `customReport` 自定义事件上报
```javascript
this.$collectLogs.customReport(
  {
    eventType: '事件名称',
    project: '上报项目名称',
  },
  {
    // 自定义字段
    ...
    // 会将该对象的所有字段作为自定义字段上报
  }
)
```

> `customFields` 更新自定义字段
```javascript
this.$collectLogs.customFields({
  // 慎用，推荐优先使用 init 中的 customFields 字段进行定义数据
  ...
  // 该方法调用后，传入的字段会覆盖 init 中的 customFields 字段
})
```

---

### 点击埋点
> `APP` 通过监听点击事件进行自动上报相关信息
- 🚫 自动上报限制
  - 不支持`APP`的`app-nvue`页面
  - 自动上报仅支持部分元素点击
    - UNI-BUTTON
    - BUTTON
    - UNI-NAVIGATOR
    - A
  - 自动上报的信息，是元素中的 innerText

> `小程序` 通过监听所有的tap事件进行自动上报相关信息
- 🚫 自动上报限制
  - 仅支持页面中绑定了`点击`事件的元素
    - @tap
    - @longpress
    - @longtap
  - 自动上报信息为空
> tips 自定义补充上报的方式
#### APP/小程序 通过自定义属性 data-log 进行上报
```javascript
// 上报的信息是 data-log 的值
<view data-log="xxx"></view>
```
#### 小程序 通过增加空的点击事件进行上报
```javascript
// 识别具有点击事件的元素，即可进行上报
<view @tap.stop></view>
<view @tap.prevent></view>
```

---

### APP接入的注意事项
> nvue页面的接入方式

由于`APP`的`app-nvue`页面，无法通过`vue`的生命周期进行埋点，所以需要手动接入
```javascript
// file xxx.nvue
import { collectLogs } from '@/utils/logs'
const logsMixin = collectLogs.lifecycleMixin()
export default {
  mixins: [logsMixin],
  ...
}
```
