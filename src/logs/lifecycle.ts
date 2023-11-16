import { useMixins } from './mixins'
import { requestHeartBeat, requestReportLog } from './report'
import { CollectLogs } from './index'
import { MpHook } from '@/types'
import { activityPage, sleep } from '@/utils'
import { isObject, isBoolean } from '@/utils/data-type'
export function proxyComponentsEvents(config: any, logs: CollectLogs) {
  const { isOnTapEvent, isOnPageLifecycle } = config
  createVueLifecycle(logs)

  const oldComponent = Component
  Component = function (
    componentOptions: Record<string, string | undefined>,
    ...arg: any[]
  ) {
    isOnTapEvent && proxyComponentsTapEvents(componentOptions, logs)

    isOnPageLifecycle && proxyComponentsLifecycleEvents(componentOptions, arg, logs)

    return oldComponent(componentOptions)
  }
}

// 创建Vue的生命周期
function createVueLifecycle(logs: CollectLogs) {
  setGlobalData(logs)
  previousPage = activityPage().route
  const mixins = useMixins()
  const mixin = mixins(logs)
  logs.vue.mixin({
    mixins: [mixin]
  })
}

// 设置APP的globalData全局变量
async function setGlobalData(logs: CollectLogs) {
  await sleep(100)
  const app = getApp({ allowDefault: true })
  if (!app) {
    return await setGlobalData(logs)
  } else {
    app.globalData.collectLogs = logs
  }
}

// 代理组件的点击事件
function proxyComponentsTapEvents(componentOptions: any, logs: CollectLogs) {
  const methods = getMethods(componentOptions.methods)
  if (methods) {
    methods.forEach((methodName) => {
      clickProxy(componentOptions.methods, methodName, logs)
    })
  }
}

// 代理组件的生命周期
let previousPage = ''
function proxyComponentsLifecycleEvents(componentOptions: any, arg: any, logs: CollectLogs) {
  const oldShow = componentOptions.methods.onShow
  if (oldShow) {
    componentOptions.methods['onShow'] = async function () {
      // await sleep(300)
      await requestReportLog({
        referer: previousPage,
        eventType: 'page_view'
      }, logs)

      oldShow.apply(this, arg)
    }
  }

  const oldHide = componentOptions.methods.onHide
  if (oldHide) {
    componentOptions.methods['onHide'] = function () {
      previousPage = activityPage().route
      requestHeartBeat(logs)

      oldHide.apply(this, arg)
    }
  }

  const oldUnload = componentOptions.methods.onUnload
  if (oldUnload) {
    componentOptions.methods['onUnload'] = function () {
      previousPage = activityPage().route
      requestHeartBeat(logs)

      oldUnload.apply(this, arg)
    }
  }
}

// 代理Page的点击事件
export function proxyPageEvents(logs: CollectLogs) {
  const oldPage = Page
  Page = function (pageOptions) {
    const methods = getMethods(pageOptions)
    if (methods) {
      methods.forEach((methodName) => {
        clickProxy(pageOptions, methodName, logs)
      })
    }
    oldPage.apply(this, arguments)
  }
}

// 点击事件代理
export function clickProxy(options: any, method: any, logs: CollectLogs) {
  const isClick = (eventType: any) => {
    return !!{
      tap: true,
      longpress: true,
      longtap: true
    }[eventType]
  }

  const fn = options[method]

  options[method] = function (...arg: any) {
    const tapsInfo = {
      tapType: '',
      tapText: ''
    }

    let eventType = ''
    let extendFields = {}
    const [args] = arg
    if (isObject(args)) {
      const { currentTarget = {}, detail } = args
      const { dataset = {} } = currentTarget
      const { x, y } = detail || {}
      const { type, logs } = dataset
      eventType = args.type
      tapsInfo.tapType = isBoolean(type) ? '' : type
      tapsInfo.tapText = isBoolean(logs) ? '' : logs

      // 拓展信息字段
      extendFields = {
        abscissa: x,
        ordinate: y,
        button_title: tapsInfo.tapText
      }
    }
    const { tapType, tapText } = tapsInfo

    return (
      eventType
        && isClick(eventType)
        && tapText
        // && tapType
        && requestReportLog({
          eventType: tapType || 'button_click',
          extendFields
        }, logs),
      fn && fn.apply(this, arg)
    )
  }
}

// 获取component的方法
export function getMethods(methods: any) {
  const mpHook: MpHook = {
    onLoad: true,
    onShow: true,
    onReady: true,
    onPullDownRefresh: true,
    onReachBottom: true,
    onShareAppMessage: true,
    onPageScroll: true,
    onResize: true,
    onTabItemTap: true,
    onHide: true,
    onUnload: true
  }

  const list = []
  for (const i in methods) {
    typeof methods[i] !== 'function' || mpHook[i] || list.push(i)
  }
  return list
}
