/**
 * uniapp小程序错误采集上报
 * Date: 2020/05/23
 */

class Logs {
  /**
   * Creates an instance of Logs.
   * @param {API} collectionApi 采集错误日志的接口
   * @param {Boolean} isProxyTapEvent 是否需要代理全局tap事件
   * @memberof Logs
   */
  constructor(collectionApi, isProxyTapEvent) {
    if (!collectionApi) { throw new Error('缺少必要参数「collectionApi」,需要传入采集错误日志的接口API') }

    this.vueApp = {} // 生命周期相关参数
    this.initConfig = { platform: 'owner' } // 用户初始化配置
    this.logList = [] // 日志入栈list
    this.systemInfo = uni.getSystemInfoSync()
    this.collectionApi = collectionApi // 上报采集的API
    this.collectionApiPath = '' // 上报采集的API路径
    this.initNetworkType = ''
    this.setApiPath()
    isProxyTapEvent && this.proxyComponentsEvents()
  }

  /**
   * 手动初始化
   * @param {Object} initConfig 初始化的配置参数,参数如下⬇️
   * @param {String} openId 用户的openId
   * @param {String} platform 平台类型
   * @param {boolean} [isShowLog=false] 是否显示console输出
   * @param {boolean} [isOnLifecycle=false] 是否监听生命周期
   * @param {boolean} [isOnCaptureScreen=false] 是否监听截图事件
   * @param {boolean} [isOnTapEvent=false] 是否监听tap点击事件
   * @param {boolean} [isTraceRoute=false] 是否追踪路由变化
   * @param {boolean} [isTraceNetwork=false] 是否追踪网络变化
   * @param {boolean} [isTraceMemory=false] 是否追踪内存变化
   * @memberof Logs
   */
  init(initConfig) {
    let { openId, platform, isShowLog = false, isOnLifecycle = false, isOnCaptureScreen = false, isOnTapEvent = false, isTraceRoute = false, isTraceNetwork = false, isTraceMemory = false } = initConfig
    if (!platform) { throw new Error('缺少必要参数「platform」,需要传入所采集的平台类型') }
    // if (!openId) openId = 'unknown'

    this.initConfig = {
      ...initConfig,
      openId,
      isShowLog,
      isOnLifecycle,
      isTraceRoute,
      isTraceNetwork,
      isTraceMemory
    }

    if (isOnTapEvent) { this.initComponentEvent() }

    if (isOnCaptureScreen) { this.onUserCaptureScreen() }

    if (isOnLifecycle) { // 是否页面/应用的开启生命周期监听
      this.onApp()
      this.onError()
      this.lastUnusualReport()
    }
  }

  onApp() {
    this.initParams()
    if (this.initConfig.isTraceMemory) { this.onMemory() }
    if (this.initConfig.isTraceNetwork) { this.onNetwork() }

    uni.onAppShow(() => {
      this.onAppShowReport()
    })
    uni.onAppHide(() => {
      this.onAppHideReport()
    })
    uni.onPageNotFound(errorInfo => {
      this.reportLog({
        errorType: 'notFount',
        errorInfo
      })
    })
  }

  // 监听用户截屏事件
  onUserCaptureScreen() {
    uni.onUserCaptureScreen(() => {
      this.reportLog({
        errorType: 'captureScreen',
        errorInfo: '用户截屏事件捕获'
      })
    })
  }

  // 监控网络状态变化
  onNetwork() {
    let typeList = {
      wifi: 'wifi 网络',
      '2g': '2g 网络',
      '3g': '3g 网络',
      '4g': '4g 网络',
      ethernet: '有线网络',
      unknown: 'Android 下不常见的网络类型',
      none: '无网络'
    }
    let type2text = type => {
      if (type) { return typeList[type] } else { return '未知网络' }
    }
    let initNetworkType = ''
    let reportNetwork = errorInfo => {
      let { networkType } = errorInfo
      let logTime = this.formatTime()
      let curr = getCurrentPages() || []
      let pagePath = 'loading'
      // this.initNetworkType = networkType
      initNetworkType = networkType
      if (curr.length) {
        let currPage = curr[curr.length - 1] || {}
        pagePath = currPage['route'] || 'unknown'
      }
      // 网络差或无网络情况下，暂时缓存不进行上报
      if (['2g', 'unknown', 'none'].includes(networkType)) {
        uni.setStorageSync('networkUnusualLogInfo', { ...errorInfo, logTime, pagePath })
      } else {
        this.reportLog({
          errorType: 'networkState',
          errorInfo
        })
        let networkInfo = uni.getStorageSync('networkUnusualLogInfo')
        uni.removeStorageSync('networkUnusualLogInfo')
        // 对上一次网络异常，可能造成的上报失败进行补上报
        networkInfo && this.reportLog({
          errorType: 'networkState',
          errorInfo: networkInfo
        })
      }
    }
    uni.getNetworkType({
      success: net => {
        let { networkType } = net
        reportNetwork({
          networkType,
          networkStatus: type2text(networkType),
          eventType: 'initNetwork'
        })
      }
    })
    uni.onNetworkStatusChange(net => {
      let { isConnected, networkType } = net
      reportNetwork({
        isConnected,
        networkType,
        networkStatus: type2text(networkType),
        // lastNetwork: this.initNetworkType,
        lastNetwork: initNetworkType,
        eventType: 'switchNetwork'
      })
    })
  }

  // 应用切到前台时
  onAppShowReport() {
    let pagesList = getCurrentPages().map(item => {
      let obj = item || {}
      return { ...obj }
    })
    let routeList = pagesList.map(e => `/${e.route || ''}`).reverse()
    // let routeList = getCurrentPages().map(e => `/${e.route}`).reverse()
    this.vueApp.entryPages = routeList[0] || 'loading'
    this.vueApp.entryDate = this.formatTime()
    if (this.timer) {
      clearInterval(this.vueApp.timer)
      this.vueApp.timer = null
      this.vueApp.seconds = 0
      this.startInterval()
    } else {
      this.startInterval()
    }
  }

  // 应用切到后台时
  onAppHideReport() {
    let pagesList = getCurrentPages().map(item => {
      let obj = item || {}
      return { ...obj }
    })
    let routeList = pagesList.map(e => `/${e.route || ''}`).reverse()
    // let routeList = getCurrentPages().map(e => `/${e.route}`).reverse()
    this.vueApp.leavePages = routeList[0]
    this.vueApp.leaveDate = this.formatTime()
    let { seconds, entryPages, leavePages, entryDate, leaveDate } = this.vueApp
    this.reportLog({
      errorType: 'stayTime',
      errorInfo: { seconds, entryPages, leavePages, entryDate, leaveDate }
    })
    clearInterval(this.vueApp.timer)
    this.vueApp.timer = null
    this.vueApp.seconds = 0
    // this.startInterval()
  }

  startInterval() {
    this.vueApp.timer = setInterval(() => {
      ++this.vueApp.seconds
    }, 1000)
  }

  // 设置API的path
  setApiPath() {
    if (this.collectionApi) {
      let mark = this.collectionApi.toString()
      let i = mark.indexOf('("')
      let j = mark.lastIndexOf('",')
      if (~i && ~j) { this.collectionApiPath = mark.slice(i + 1, j) }
    }
  }

  // 初始化预上报使用App参数
  initParams() {
    this.vueApp = {
      timestamp: null,
      timer: null,
      seconds: 0,
      entryPages: '',
      leavePages: '',
      entryDate: '',
      leaveDate: ''
    }
  }

  /**
   * 监听小程序onError事件
   * @memberof Logs
   */
  onError() {
    uni.onError(errorInfo => {
      this.reportLog({
        errorType: 'onError',
        errorInfo
      })
      this.reportLog({
        errorType: 'logList',
        isClearLog: true
      })
    })
  }

  /**
   * 当 iOS/Android 向小程序进程发出内存警告时，触发该事件
   * @memberof Logs
   */
  onMemory() {
    uni.onMemoryWarning(error => {
      console.log('errorInfo:', error)
      let memoryLevel = {
        0: '无等级',
        5: '内存轻微',
        10: '内存不足',
        15: '内存临界'
      }
      let { level = '0' } = error
      let errorInfo = memoryLevel[level]
      // Android手机先将错误日志存储到本地，下次进入小程序时再读取相关错误日志，进行上报
      if (typeof this.systemInfo.system === 'string' && ~this.systemInfo.system.indexOf('Android')) {
        // 对本次内存溢出造成闪退的日志信息进行存储
        uni.setStorageSync('memoryUnusualLogInfo', errorInfo)
        uni.setStorageSync('unusualLogList', this.logList)
      } else { // 非Android手机直接上报
        this.reportLog({
          errorType: 'memory',
          errorInfo
        })
        this.reportLog({
          errorType: 'logList',
          isClearLog: true
        })
      }
    })
  }

  // 最后一次小程序异常情况，再次启动小程序后进行补上报
  lastUnusualReport() {
    let errorInfo = uni.getStorageSync('memoryUnusualLogInfo')
    let logList = uni.getStorageSync('unusualLogList')
    let networkInfo = uni.getStorageSync('networkUnusualLogInfo')

    // 对上一次内存溢出，造成闪退存储的日志记录进行上报
    if (logList && logList.length) {
      this.logList = logList
      this.reportLog({
        errorType: 'logList',
        isClearLog: true
      }).then(() => uni.removeStorageSync('unusualLogList'))
    }

    // 对上一次内存溢出，造成闪退存储的内存错误进行上报
    if (errorInfo && typeof errorInfo === 'string') {
      this.reportLog({
        errorType: 'memory',
        errorInfo
      }).then(() => uni.removeStorageSync('memoryUnusualLogInfo'))
    }

    // 对上一次网络异常，可能造成的上报失败进行补上报
    networkInfo && this.reportLog({
      errorType: 'networkState',
      errorInfo: networkInfo
    }).then(() => uni.removeStorageSync('networkUnusualLogInfo'))
  }

  /**
   * 格式化时间
   * @param {timestamp} 时间戳
   * @returns YYYY-MM-DD hh:mm:ss
   * @memberof Logs
   */
  formatTime(time = new Date()) {
    let y = time.getFullYear()
    let mm = time.getMonth() + 1
    let d = time.getDate()
    let h = time.getHours()
    let m = time.getMinutes()
    let s = time.getSeconds()
    if (mm < 10) { mm = `0${ mm}` }
    if (d < 10) { d = `0${ d}` }
    if (h < 10) { h = `0${ h}` }
    if (m < 10) { m = `0${ m}` }
    if (s < 10) { s = `0${ s}` }
    return `${y}-${mm}-${d} ${h}:${m}:${s}`
  }

  /**
   * 日志输出
   * @param {*} logType 输出类型
   * @param {*} logText 输出文本
   * @memberof Logs
   */
  logOutput(logType, logText) {
    // 在 this.$logs.init({}) 时开启isShowLog配置
    if (this.initConfig.isShowLog) {
      let type = logType.toLowerCase()
      if (~type.indexOf('warn')) { console.log('%cLogs:', 'color: #E6A23C; font-weight: bolder', `上报类型-${logType}: `, logText) } else if (~type.indexOf('error')) { console.log('%cLogs:', 'color: #F56C6C; font-weight: bolder', `上报类型-${logType}: `, logText) } else { console.log('%cLogs:', 'color: #67C23A; font-weight: bolder', `上报类型-${logType}: `, logText) }
    }
  }

  // 代理组件tap事件
  proxyComponentsEvents() {
    let that = this
    let autoTrack = {
      appLaunch: !0,
      appShow: !0,
      appHide: !0,
      pageShow: !0,
      pageShare: !0,
      mpClick: !0
    }
    /* eslint-disable no-undef */
    let oldComponent = Component
    Component = function (obj) {
      try {
        let list = autoTrack && that.getMethods(obj.methods)
        if (list) {
          for (let i = 0, len = list.length; i < len; i++) {
            that.clickProxy(obj.methods, list[i])
          }
        }
        oldComponent.apply(this, arguments)
      } catch (obj) {
        oldComponent.apply(this, arguments)
      }
    }
  }

  test() {
    const originRequest = wx.request
    Object.defineProperty(wx, 'request', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: function (e) {
        const config = arguments[0] || {}
        const originSuccess = e.success
        const originFail = e.fail
        // 直接发送请求，不上报
        console.log('上报ajax数据啦!', config)
        e.success = function (...args) {
          console.log('success', args)
          originSuccess.call(this, ...args)
        }
        config.fail = function (...args) {
          console.log('fail', args)
          originFail.call(this, ...args)
        }
        return originRequest.apply(this, arguments)
      }
    })
  }

  // 获取component的方法
  getMethods(methods) {
    const mpHook = {
      data: 1,
      onLoad: 1,
      onShow: 1,
      onReady: 1,
      onPullDownRefresh: 1,
      onReachBottom: 1,
      onShareAppMessage: 1,
      onPageScroll: 1,
      onResize: 1,
      onTabItemTap: 1,
      onHide: 1,
      onUnload: 1
    }
    let list = []
    for (let i in methods) {
      (typeof methods[i] !== 'function') || mpHook[i] || list.push(i)
    }
    return list
  }

  // 事件代理
  clickProxy(fnList, fnStr) {
    let isClick = (eventType) => {
      return !!{
        tap: true,
        longpress: true,
        longtap: true
      }[eventType]
    }
    let isObject = (arg) => {
      return (arg !== null) && (toString.call(arg) === '[object Object]')
    }
    let fn = fnList[fnStr]
    let that = this
    fnList[fnStr] = function () {
      let logsInfo = {}
      let eventType = ''
      let [args] = arguments
      if (isObject(args)) {
        let { currentTarget = {} } = args
        let { dataset = {} } = currentTarget
        eventType = args.type
        logsInfo.errorType = dataset.type
        logsInfo.errorInfo = dataset.logs
      }
      let { errorType, errorInfo } = logsInfo
      // 是否上报tap事件
      let { isOnTapEvent = false } = that.initConfig || {}

      // 1、DOM标签中未设置「data-type」属性时，errorType为undefined
      // 2、DOM标签中设置「data-type=""」为空时，errorType为true
      if (typeof errorType === 'boolean' || !errorType) { errorType = 'userClick' }

      /* eslint-disable-next-line */
      return eventType && isClick(eventType) && errorInfo && isOnTapEvent && that.reportLog({ errorType, errorInfo }), fn && fn.apply(this, arguments)
    }
  }

  // 初始化所有组件的事件
  initComponentEvent(closeThisMethod = true) {
    if (closeThisMethod) { return }
    let that = this

    const autoTrack = {
      appLaunch: !0,
      appShow: !0,
      appHide: !0,
      pageShow: !0,
      pageShare: !0,
      mpClick: !0
    }

    let oldApp = App
    App = function () {
      oldApp.apply(this, arguments)
    }

    let oldPage = Page
    Page = function (t) {
      let list = autoTrack && that.getMethods(t)
      if (list) {
        for (let i = 0, len = list.length; i < len; i++) {
          that.clickProxy(t, list[i])
        }
      }
      oldPage.apply(this, arguments)
    }

    let oldComponent = Component
    Component = function (obj) {
      try {
        let list = autoTrack && that.getMethods(obj.methods)
        if (list) {
          for (let i = 0, len = list.length; i < len; i++) {
            that.clickProxy(obj.methods, list[i])
          }
        }
        oldComponent.apply(that, arguments)
      } catch (obj) {
        oldComponent.apply(that, arguments)
      }
    }
  }

  /**
   * 将log数据初始化
   * @param {*} logText 日志说明
   * @param {string} logType 日志类型
   * @param {string} logMark 日志备注信息(如API接口)
   * @memberof Logs
   */
  logInit(logText, logType = 'info', logMark = '') {
    if (typeof logText === 'object') { logText = JSON.stringify(logText) }

    // 如果是API类型的，可以按如下方式将传入的API传入，将会打印记录下来 logType: apiXXXX, logMark: API
    // 例如 .then(res => this.$logs.logInit(res.data, 'apiSuccess', API))
    // 例如 .catch(err => this.$logs.logInit(err, 'apiError', API))
    if (typeof logType === 'string' && ~logType.indexOf('api')) {
      if (logMark) {
        let mark = logMark.toString()
        let i = mark.indexOf('"')
        let j = mark.lastIndexOf('"')
        if (~i && ~j) { logMark = mark.slice(i + 1, j) }
      }
    }

    // if (this.initConfig.isShowLog) { // 在 this.$logs.init({}) 时开启isShowLog配置
    //   let type = logType.toLowerCase()
    //   if (~type.indexOf('warn')) console.warn(`log ${logType}: `, logMark, logText)
    //   else if (~type.indexOf('error')) console.error(`log ${logType}: `, logMark, logText)
    //   else console.log(`log ${logType}: `, logText)
    // }
    this.logOutput(logType, { logText, logMark })

    this.recordLog(logText, logType, logMark)
  }

  /**
   * 将log信息入栈，记录所有日志
   * @param {string} logText 日志说明
   * @param {string} logType 日志类型
   * @param {string} logMark 日志备注信息(如API接口)
   * @memberof Logs
   */
  recordLog(logText, logType = 'info', logMark = '') {
    // let logTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
    let logTime = this.formatTime()
    let info = {
      logText,
      logMark,
      logType,
      logTime
    }
    let arr = this.logList.filter(v => { return v.logMark === logMark }) // 对已有的错误信息去重
    if (!arr.length) {
      if (this.logList.length >= 10) { // 超过10个log，就一次上报，并清空栈
        this.reportLog({ //
          errorType: 'logList',
          isClearLog: true
        })
      } else { this.logList.push(info) }
    }
  }

  /**
   * 直接上报相关错误、异常、日志信息
   * @param {Object} 接收上报信息 { errorType, errorInfo, requestId, isClearLog }
   * errorType <String> logInfo:日志信息 / logList: 日志记录 / memory: 内存信息 / onError: Js错误 / apiWarn: api返回非200 / apiError: api请求失败 / apiTimeout: api请求超时 / reportError: 上报失败 / socketError: socket错误
   * errorInfo <String> 错误信息
   * requestId <String> 唯一请求ID
   * isClearLog <Boolean> 上报完后是否清除logList
   * @memberof Logs
   */
  reportLog({ errorType = 'logInfo', errorInfo = '', requestId = '', reportOpenId = '', reportPlatform = '', apiQuery = '', isClearLog = false }) {
    let that = this
    // 如果采集到到是上报接口，则停止执行，否则会死循环
    if (typeof errorInfo === 'string' && ~errorInfo.indexOf(this.collectionApiPath)) { return }
    // 可以不必纠结于「errorInfo」的类型是传入objet还是string
    if (typeof errorInfo === 'object') { errorInfo = JSON.stringify(errorInfo) }
    let storeOpenId = uni.getStorageSync('openId')
    let openId = reportOpenId || this.initConfig.openId || storeOpenId || 'unknown'
    let platform = reportPlatform || this.initConfig.platform || 'unknown'
    let { SDKVersion = '无', version = '无', system = '无', model = '无', brand = '无' } = this.systemInfo
    let curr = getCurrentPages() || []
    let pagePath = 'loading'
    let params = ''
    let options = {}
    if (curr.length) {
      let currPage = curr[curr.length - 1] || {}
      pagePath = currPage['route'] || 'unknown'
      options = currPage['options'] || {}
      params = JSON.stringify(options)
    }
    let info = {
      openId,
      platform,
      pagePath,
      params,
      apiQuery,
      requestId: requestId || `${Date.now()}_${openId.padStart(28, '_').slice(22)}`,
      systemInfo: `引擎版本号:${version}, 操作系统:${system}, 手机型号:${model}, 手机品牌: ${brand}`,
      basicVersion: SDKVersion
    }
    if (isClearLog && !this.logList.length) { return }
    if (isClearLog) { errorInfo = JSON.stringify(this.logList) }
    this.logOutput(errorType, errorInfo)
    if (!this.collectionApi) { return }
    return new Promise(function (resolve, reject) {
      that.collectionApi({ ...info, errorType, errorInfo }).then(() => {
        if (isClearLog) { that.logList = [] }
        resolve({})
      }).catch(() => reject(new Error('上报失败')))
    })
  }

  install(Vue) {
    Vue.prototype.$logs = this
    Vue.mixin({
      data() {
        return {
          timer: null,
          seconds: 0,
          previousRoutes: [],
          currentsRoutes: []
        }
      },
      onShow(options) {
        if (!this.$logs.initConfig.isTraceRoute) { return }
        if (options) {
        }
        let pagesList = getCurrentPages().map(item => {
          let obj = item || {}
          return { ...obj }
        })
        let routeList = pagesList.map(e => `/${e.route || ''}`).reverse()
        // let routeList = getCurrentPages().map(e => `/${e.route}`).reverse()
        this.currentPages = routeList[0]
        this.currentsRoutes = [...routeList]
        if (this.timer) {
          this.compareRouterList() && this.$logs.reportLog({
            errorType: 'stayTime',
            errorInfo: {
              seconds: this.seconds,
              pagePath: this.compareRouterList()
            }
          })
          this.clearInterval(this.timer)
          uni.setStorageSync('previousRoutes', routeList)
          // this.previousRoutes = [ ...routeList ]
        } else {
          this.startInterval()
          uni.setStorageSync('previousRoutes', routeList)
          // this.previousRoutes = [ ...routeList ]
        }
      },
      onHide() {
        if (!this.$logs.initConfig.isTraceRoute) { return }
        let hideTimestamp = uni.getStorageSync('hideTimestamp')
        if (hideTimestamp) {
          if ((Date.now() - hideTimestamp) < 500) {
            uni.setStorageSync('hideTimestamp', Date.now())
            return
          }
        }
        // console.log('=====logs hide====', Date.now())
        uni.setStorageSync('hideTimestamp', Date.now())
        this.$logs.reportLog({
          errorType: 'stayTime',
          errorInfo: {
            seconds: this.seconds,
            pagePath: this.currentPages
          }
        })
        this.clearInterval(this.timer)
      },
      onUnload() {
        // console.log('logs onUnload')
      },
      methods: {
        startInterval() {
          this.timer = setInterval(() => {
            ++this.seconds
          }, 1000)
        },
        clearInterval() {
          clearInterval(this.timer)
          this.timer = null
          this.seconds = 0
          this.startInterval()
        },
        compareRouterList() {
          let routeList = uni.getStorageSync('previousRoutes')
          if (routeList.length < this.currentsRoutes.length) {
            return this.currentsRoutes.filter(item => {
              return !routeList.includes(item)
            })[0]
          } else {
            return routeList.filter(item => {
              return !this.currentsRoutes.includes(item)
            })[0]
          }
        }
      }
    })
  }
}

// var oldPage = Page
// Page = function (t) {
//   console.log('==pxy Page===', t)
//   oldPage.apply(this, arguments)
// }

// var oldApp = App;
// App = function (t) {
//   console.log('==pxy App===', t)
//   oldApp.apply(this, arguments)
// }

export default Logs
