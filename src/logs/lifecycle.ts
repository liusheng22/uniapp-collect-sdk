import { onPageHide } from './onPage'
import { CollectLogs } from './index'
import { activityPage, getUuid, sleep } from '@/utils'
import { isObject } from '@/utils/data-type'

export function proxyComponentsTapEvents(logs: CollectLogs) {
  const oldComponent = Component
  Component = function (componentOptions: any, ...arg: any[]) {
    const methods = getMethods(componentOptions.methods)
    if (methods) {
      methods.forEach((methodName) => {
        clickProxy(componentOptions.methods, methodName, logs)
      })
    }

    let isNewLoad = true
    let showTime: any
    let hideTime: any

    const oldLoad = componentOptions.methods.onLoad
    if (oldLoad) {
      componentOptions.methods['onLoad'] = function (args: any) {
        console.log('onLoad====>', activityPage().route, args)
        // todo: 执行页面浏览上报
        logs.report({
          id: getUuid(),
          eventType: 'page_view',
          errorInfo: activityPage().route,
          loadOptions: activityPage().options
        })
        isNewLoad = false
        oldLoad.apply(this, arg)
      }
    }

    const oldShow = componentOptions.methods.onShow
    if (oldShow) {
      componentOptions.methods['onShow'] = async function () {
        await sleep(300)
        if (isNewLoad) {
          const path = activityPage().route
          console.log('oldShow====>', path)
          showTime = Date.now()
        } else {
          isNewLoad = true
          console.log('oldShow====>>>', Date.now())
          showTime = Date.now()
        }
        oldShow.apply(this, arg)
      }
    }

    const oldHide = componentOptions.methods.onHide
    if (oldHide) {
      componentOptions.methods['onHide'] = function () {
        const path = activityPage().route
        hideTime = Date.now()
        const time: any = ((hideTime - showTime) / 1000).toFixed(2)
        console.log('onHide====>', {
          path,
          time
        })
        logs.report({
          errorType: 'stayTime',
          errorInfo: `${time }s`
          // params: activityPage().options
        })
        oldHide.apply(this, arg)
      }
    }

    const old = componentOptions.methods.onUnload
    if (old) {
      componentOptions.methods['onUnload'] = function () {
        const path = activityPage().route
        hideTime = Date.now()
        const time: any = ((hideTime - showTime) / 1000).toFixed(2)
        console.log('onUnload====>', {
          path,
          time
        })
        logs.report({
          errorType: 'stayTime',
          errorInfo: `${time }s`
          // params: activityPage().options
        })
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
      tapId: ''
    }
    let eventType = ''
    const [args] = arg
    if (isObject(args)) {
      const { currentTarget = {} } = args
      const { dataset = {} } = currentTarget
      const { type, tapid } = dataset
      eventType = args.type
      tapsInfo.tapType = type
      tapsInfo.tapId = tapid
    }
    const { tapType, tapId } = tapsInfo

    // console.log('-----tapsInfo----', tapsInfo)

    // 1、DOM标签中未设置「data-type」属性时，tapType为undefined
    // 2、DOM标签中设置「data-type=""」为空时，tapType为true
    // if (typeof tapType === 'boolean' || !tapType) return null

    return (
      eventType
        && isClick(eventType)
        // && tapId
        // && tapType
        && logs.report({ errorInfo: tapsInfo }),
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
