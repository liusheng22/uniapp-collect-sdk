import { proxyComponentsTapEvents, rewritePage } from './lifecycle'
import {
  onUserCaptureScreen,
  onMemory,
  onNetwork,
  lastUnusualReport
} from './events'
import { onApp } from './onApp'
import { onError } from './onError'
import { reportLog } from './report'

export interface Success {
  statusCode: number
  reqQuery: any
  data: any
}

export interface Fail {
  statusCode: number
  data: any
}

export interface ReportOpts {
  errorType?: string
  errorInfo: any
  params?: any
  requestId?: string
  userId?: string
  reportPlatform?: string
  apiQuery?: string
  isClearLog?: boolean
}

export interface ResConfig {
  data: any
  url: string
}

export interface InitConfig {
  uniqueId?: string
  platform?: string
  isShowLog?: boolean
  isOnLifecycle?: boolean
  isOnCaptureScreen?: boolean
  isOnTapEvent?: boolean
  isTraceRoute?: boolean
  isTraceNetwork?: boolean
  isTraceMemory?: boolean
}

export interface PageOpts {
  route: string
  options: any
}

export function activityPage(): PageOpts {
  const pagesList = getCurrentPages()
    .map((item: any) => {
      const obj = item || {}
      return obj
    })
    .reverse()
  const [curr] = pagesList
  return curr || {}
}

export class Logs {
  public oriRequest: any
  public logList: Array<ReportOpts>
  public systemInfo: any
  public initConfig: InitConfig
  public vueApp: any

  constructor() {
    this.oriRequest = wx.request
    this.logList = []
    this.systemInfo = wx.getSystemInfoSync()
    this.initConfig = {}

    // 监听component的methods
    // proxyComponentsTapEvents(this)
    // this.init()
  }

  public init(config: InitConfig) {
    const {
      uniqueId,
      platform,
      isShowLog = false,
      isOnLifecycle = false,
      isOnCaptureScreen = false,
      // isOnTapEvent = false,
      isOnTapEvent = true,
      isTraceRoute = false,
      isTraceNetwork = false,
      isTraceMemory = false
    } = config
    if (!platform)
      throw new Error('缺少必要参数「platform」,需要传入所采集的平台类型')
    // if (!openId) openId = 'unknown'

    this.initConfig = {
      ...config,
      uniqueId,
      isShowLog,
      isOnLifecycle,
      isTraceRoute,
      isTraceNetwork,
      isTraceMemory
    }

    // 点击事件
    if (isOnTapEvent) proxyComponentsTapEvents(this)
    // 截屏事件
    if (isOnCaptureScreen) onUserCaptureScreen(this)
    // 内存事件
    if (isTraceMemory) onMemory(this)
    // 网络状态
    if (isTraceNetwork) onNetwork(this)
    // proxyPageEvents(this)
    rewritePage(this)

    // 是否页面/应用的开启生命周期监听
    if (isOnLifecycle) {
      onApp(this)
      onError(this)
      lastUnusualReport(this)
    }

    // let that = this

    // let { uniqueId } = config
    // this.initConfig = config
  }

  public async report(obj: ReportOpts, logs: Logs = this) {
    // return new Promise((resolve, reject) => {
    //   reportLog(obj, logs)
    //     .then((data: any) => {
    //       resolve(data)
    //     })
    //     .catch((err) => {
    //       reject(err)
    //     })
    // })
    return reportLog(obj, logs)
  }

  public successResponse(success: Success, config: ResConfig) {
    console.log('config =>', config)
    // let { url } = config
    // if (~url.indexOf('error-collect')) return // 避免循环上报
    const { statusCode, reqQuery, data: resData } = success
    if (statusCode !== 200) {
      console.log('resData =>', resData)
      this.report({
        errorInfo: resData,
        apiQuery: reqQuery
      })
    }
  }
}
