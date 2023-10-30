// import { reportLog } from './report'
// import { formatTime } from '@/utils/index'
import { Logs, activityPage } from './index'
import { onPageHide } from './onPage'

export function sleep(time = 1500): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, time))
}

export function proxyComponentsTapEvents(logs: Logs) {
  const oldComponent = Component
  Component = function (componentOptions: any, ...arg: any[]) {
    const methods = getMethods(componentOptions.methods)
    if (methods) {
      methods.forEach((methodName) => {
        clickProxy(componentOptions.methods, methodName, logs)
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

    let isNewLoad = true
    let showTime: any
    let hideTime: any

    const oldLoad = componentOptions.methods.onLoad
    if (oldLoad) {
      componentOptions.methods['onLoad'] = function (args: any) {
        console.log('onLoad====>', activityPage().route, args)
        // todo: 执行页面浏览上报
        logs.report({
          errorType: 'onLoad',
          errorInfo: activityPage().route
          // params: activityPage().options
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
          errorInfo: time + 's'
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
          errorInfo: time + 's'
          // params: activityPage().options
        })
        old.apply(this, arg)
      }
    }
    // try {
    //   var methods = getMethods(componentOptions.methods)
    //   if (methods) {
    //     methods.forEach((method: any) => {
    //       clickProxy(componentOptions.methods, method)
    //     })
    //   }
    //   oldComponent.apply(this, arguments)
    // } catch (obj) {
    //   oldComponent.apply(this, arguments)
    // }

    return oldComponent(componentOptions)
  }
}

export function proxyPageEvents(logs: Logs) {
  const oldPage = Page
  Page = function (pageOptions) {
    const methods = getMethods(pageOptions)
    console.log('methods', methods)
    if (methods) {
      methods.forEach((methodName) => {
        // if (['onShow', 'onHide'].includes(methodName)) {
        //   methods[methodName] = function () {}
        // }
        // if (methodName === 'onShow') {
        //   let oldOnShow = methods[methodName]
        //   methods[methodName] = function () {
        //     onPageShow(logs, oldOnShow)
        //   }
        // }
        if (methodName === 'onHide') {
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

export function rewritePage(logs: Logs) {
  const originPage = Page

  Page = function (pageOptions) {
    // Object.keys(pageOptions).forEach((methodName) => {
    const methods = getMethods(pageOptions)
    methods.forEach((methodName) => {
      clickProxy(methods, methodName, logs)
      const originMethod = pageOptions[methodName]
      if (typeof originMethod !== 'function') {
        return true
      }
      // eslint-disable-next-line @typescript-eslint/no-extra-semi
      ;(pageOptions as any)[methodName] = function (options: any) {
        if (['onLoad', 'onShow'].includes(methodName)) {
          console.log('-------me------', methodName)
        }

        return originMethod.call(this, options)
      }
    })

    return originPage(pageOptions)
  }

  const oldApp = App
  App = function (option) {
    return oldApp(option)
  }
}

// 事件代理
export function clickProxy(options: any, method: any, logs: Logs) {
  const isClick = (eventType: any) => {
    return !!{
      tap: true,
      longpress: true,
      longtap: true
    }[eventType]
  }
  const isObject = (arg: any) => {
    return arg !== null && toString.call(arg) === '[object Object]'
  }
  const fn = options[method]

  // console.log('----fn----1', method, fn)
  // let that = this
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
      eventType &&
        isClick(eventType) &&
        tapId &&
        tapType &&
        /* eslint-disable-next-line */
        // that.postActionClick(tapType, tapId),
        // console.log('===tapType, tapId===', tapType, tapId),
        logs.report({ errorInfo: tapsInfo }),
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
