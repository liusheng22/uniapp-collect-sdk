import { useMixins } from './mixins'
import { requestHeartBeat, requestReportLog } from './report'
import { CollectLogs } from './index'
import { MpHook } from '@/types'
import { activityPage, debounce, sleep } from '@/utils'
import { isObject, isBoolean } from '@/utils/data-type'

export function proxyComponentsEvents(config: any, logs: CollectLogs) {
  const { isOnTapEvent, isOnPageLifecycle } = config
  createVueLifecycle(isOnPageLifecycle, logs)
  const oldComponent = Component
  Component = function (componentOptions: any, ...arg: any[]) {
    isOnTapEvent && proxyComponentsTapEvents(componentOptions, arg, logs)

    isOnPageLifecycle && proxyComponentsLifecycleEvents(componentOptions, arg, logs)

    return oldComponent(componentOptions)
  }
}

function createVueLifecycle(isOnPageLifecycle: boolean, logs: CollectLogs) {
  previousPage = activityPage().route
  const mixins = useMixins()
  const mixin = mixins(logs)
  logs.Vue.mixin({
    mixins: [mixin]
  })
}

function proxyComponentsTapEvents(componentOptions: any, arg: any, logs: CollectLogs) {
  const methods = getMethods(componentOptions.methods)
  if (methods) {
    methods.forEach((methodName) => {
      clickProxy(componentOptions.methods, methodName, logs)
    })
  }
}

let previousPage = ''
function proxyComponentsLifecycleEvents(componentOptions: any, arg: any, logs: CollectLogs) {
  // const oldLoad = componentOptions.methods.onLoad
  // if (oldLoad) {
  //   componentOptions.methods['onLoad'] = function (args: any) {
  //     console.log('onLoad====>', activityPage().route, args)
  //     // logs.reportLog({
  //     //   id: getUuid(),
  //     //   eventType: 'page_view',
  //     //   errorInfo: activityPage().route,
  //     //   loadOptions: activityPage().options
  //     // })
  //     // isNewLoad = false
  //     oldLoad.apply(this, arg)
  //   }
  // }

  const oldShow = componentOptions.methods.onShow
  if (oldShow) {
    componentOptions.methods['onShow'] = async function () {
      // await sleep(300)
      console.log('onShow====>', activityPage().route)
      await requestReportLog({
        referer: previousPage,
        // id: setUuid(),
        eventType: 'page_view'
      }, logs)
      // previousPage = activityPage().route

      oldShow.apply(this, arg)
    }
  }

  const oldHide = componentOptions.methods.onHide
  if (oldHide) {
    componentOptions.methods['onHide'] = function () {
      console.log('onHide====>', activityPage().route)
      previousPage = activityPage().route
      requestHeartBeat(logs)

      oldHide.apply(this, arg)
    }
  }

  const oldUnload = componentOptions.methods.onUnload
  if (oldUnload) {
    componentOptions.methods['onUnload'] = function () {
      console.log('onUnload====>', activityPage().route)
      previousPage = activityPage().route
      requestHeartBeat(logs)

      oldUnload.apply(this, arg)
    }
  }
}

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

// 事件代理
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
        // avail_width: windowWidth,
        // avail_height: windowHeight,
        button_title: tapsInfo.tapText
      }
    }
    const { tapType, tapText } = tapsInfo
    // console.log(tapsInfo)

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
