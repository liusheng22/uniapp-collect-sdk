// @ts-ignore
// eslint-disable-next-line no-useless-escape
import uniPages from 'uni-pages?{\"type\":\"style\"}'
console.log('🚀 ~ file: index.ts:4 ~ uniPages:', uniPages)
import {
  onUserCaptureScreen,
  onMemory,
  onNetwork,
  lastUnusualReport
} from './events'
import { proxyComponentsEvents } from './lifecycle'
import { onApp } from './onApp'
import { onError } from './onError'
import { proxyRequest } from './proxyRequest'
import { requestReportLog } from './report'
import { ReportOpts, InitConfig, Success, ResConfig } from '../types'
import { wxb, defaultConfig } from '@/constants'
import { consoleLog } from '@/utils/console-log'
import { validateParams } from '@/utils/validate'

export class CollectLogs {
  private static instance: CollectLogs | null = null

  public request: any
  public pages: any
  public logList: Array<ReportOpts>
  public systemInfo: any
  public initConfig: InitConfig
  public vueApp: any
  public Vue: any

  constructor(Vue: any) {
    if (CollectLogs.instance) {
      return CollectLogs.instance
    }
    // 初始化实例
    CollectLogs.instance = this

    this.request = wxb.request
    this.logList = []
    this.pages = {}
    this.systemInfo = wxb.getSystemInfoSync()
    this.Vue = Vue
    this.initConfig = defaultConfig
  }

  public init(config: InitConfig) {
    this.pages = uniPages?.pages || []
    this.vueApp = {}

    this.initConfig = { ...this.initConfig, ...config }
    // 校验字段
    const [validate, error] = validateParams(this.initConfig)
    if (validate) {
      throw new Error(error)
    }
    const { isOnTapEvent, isOnPageLifecycle, isOnCaptureScreen, isTraceMemory, isOnAppLifecycle, isTraceNetwork } = this.initConfig
   
    // 点击事件/路由事件
    proxyComponentsEvents({
      isOnTapEvent,
      isOnPageLifecycle
    }, this)
    // if (isOnTapEvent) { proxyComponentsTapEvents(this) }
    // 截屏事件
    if (isOnCaptureScreen) { onUserCaptureScreen(this) }
    // 内存事件
    if (isTraceMemory) { onMemory(this) }
    // 网络状态
    if (isTraceNetwork) { onNetwork(this) }
    // 页面生命周期
    // if (isOnPageLifecycle) { proxyPageEvents(this) }

    // 是否页面/应用的开启生命周期监听
    if (isOnAppLifecycle) {
      onApp(this)
      onError(this)
      lastUnusualReport(this)
    }
  }

  public async reportLog(obj: ReportOpts, logs: CollectLogs = this) {
    return new Promise((resolve, reject) => {
      requestReportLog(obj, logs)
        .then((data: any) => {
          resolve(data)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  public successResponse(success: Success, config: ResConfig) {
    console.log('config =>', config)
    const { statusCode, reqQuery, data: resData } = success
    if (statusCode !== 200) {
      this.reportLog({
        errorInfo: resData,
        apiQuery: reqQuery
      })
    }
  }
}
