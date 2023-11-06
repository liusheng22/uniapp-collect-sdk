import { onPageHide } from './onPage'
import { requestHeartBeat, requestReportLog } from './report'
import { CollectLogs } from './index'
import { activityPage, sleep } from '@/utils'
import { isObject, isBoolean } from '@/utils/data-type'
import { setUuid } from '@/utils/uuid'

export function proxyComponentsTapEvents(logs: CollectLogs) {
  const oldComponent = Component
  Component = function (componentOptions: any, ...arg: any[]) {
    const methods = getMethods(componentOptions.methods)
    if (methods) {
      methods.forEach((methodName) => {
        clickProxy(componentOptions.methods, methodName, logs)
      })
    }

    const isNewLoad = true
    let showTime: any
    let hideTime: any
    let previousPage = ''

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
        await sleep(300)
        console.log('onShow====>', activityPage().route)
        // logs.reportLog({
        console.log('🚀 ~ file: lifecycle.ts:50 ~ previousPage:', previousPage)
        await requestReportLog({
          referer: previousPage,
          id: setUuid(),
          eventType: 'page_view'
        }, logs)
        previousPage = activityPage().route

        oldShow.apply(this, arg)
      }
    }

    const oldHide = componentOptions.methods.onHide
    if (oldHide) {
      componentOptions.methods['onHide'] = function () {
        console.log('onHide====>', activityPage().route)
        requestHeartBeat(logs)

        oldHide.apply(this, arg)
      }
    }

    const old = componentOptions.methods.onUnload
    if (old) {
      componentOptions.methods['onUnload'] = function () {
        console.log('onUnload====>', activityPage().route)
        requestHeartBeat(logs)

        old.apply(this, arg)
      }
    }

    return oldComponent(componentOptions)
  }
}

export function proxyPageEvents(logs: CollectLogs) {
  const oldPage = Page
  Page = function (pageOptions) {
    const methods = getMethods(pageOptions)
    if (methods) {
      methods.forEach((methodName) => {
        if (['onShow', 'onHide'].includes(methodName)) {
          methods[methodName] = function () {}
        }
        if (methodName === 'onShow') {
          console.log('代理了-------onshow')
          const oldOnShow = methods[methodName]
          methods[methodName] = function () {
            // onPageShow(logs, oldOnShow)
          }
        }
        if (methodName === 'onHide') {
          console.log('代理了-------onhide')
          // let oldOnHide = methods[methodName]
          onPageHide(logs, methods, methodName)
          // methods[methodName] = function () {
          //   onPageHide(logs, oldOnHide)
          // }
        }
        // console.log('componentOptions.methods', componentOptions.methods, methodName)
        clickProxy(pageOptions, methodName, logs)
        // const originMethod = componentOptions[methodName]
        // // originMethod.apply(this, arguments)
        // if (typeof originMethod !== "function") {
        //   return true
        // }

        // (componentOptions.methods as any)[methodName] = function (options: any) {
        //   return originMethod.call(this, options)
        // }
      })
    }
    // console.log('list', list)
    // if (list) {
    //   for (var i = 0, len = list.length; i < len; i++) {
    //     console.log('proxy-page-event', pageOptions, list[i])
    //     // clickProxy(pageOptions, list[i], logs)
    //     onPageShow(logs)
    //   }
    // }
    return oldPage(pageOptions)
    // oldPage.apply(this, arguments)
  }
  // onPageHide(logs)
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
    const {
      windowHeight,
      windowWidth
    } = logs.systemInfo
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
        avail_width: windowWidth,
        avail_height: windowHeight,
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

interface MpHook {
  [key: string]: boolean
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
