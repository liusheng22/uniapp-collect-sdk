// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line no-useless-escape
import uniPages from 'uni-pages?{\"type\":\"style\"}'
import {
  onUserCaptureScreen,
  onMemory,
  onNetwork,
  lastUnusualReport
} from './events'
import { proxyComponentsTapEvents, proxyPageEvents } from './lifecycle'
import { onApp } from './onApp'
import { onError } from './onError'
import { requestReportLog } from './report'
import { ReportOpts, InitConfig, Success, ResConfig } from '../types'
import { wxb } from '@/constants'
import { consoleLog } from '@/utils/console-log'
import { validateParams } from '@/utils/validate'

export class CollectLogs {
  public request: any
  public pages: any
  public logList: Array<ReportOpts>
  public systemInfo: any
  public initConfig: InitConfig
  public vueApp: any
  public Vue: any

  constructor(Vue: any) {
    Vue.mixin({
      onShow() {
        // console.log('自己创建的mixin onShow')
      },
      onHide() {
        // console.log('自己创建的mixin onHide')
      },
      onUnload() {
        // console.log('自己创建的mixin onUnload')
      }
    })

    this.request = wxb.request
    this.logList = []
    this.pages = {}
    this.systemInfo = wxb.getSystemInfoSync()
    this.initConfig = {
      customFields: {}
    }

    // 监听component的methods
    // proxyComponentsTapEvents(this)
  }

  public init(config: InitConfig) {
    const {
      uniqueId,
      // platform,
      customFields,
      isShowLog = false,
      isOnLifecycle = false,
      isOnCaptureScreen = false,
      isOnTapEvent = false,
      isTraceRoute = false,
      isTraceNetwork = false,
      isTraceMemory = false
    } = config
    this.pages = uniPages.pages

    // if (!platform) { throw new Error('缺少必要参数「platform」,需要传入所采集的平台类型') }
    // if (!openId) openId = 'unknown'

    // 校验字段
    const [validate, error] = validateParams({
      customFields
    })
    if (validate) {
      throw new Error(error)
    }

    this.vueApp = {}
    this.initConfig = {
      ...config,
      uniqueId,
      isShowLog,
      isOnLifecycle,
      isTraceRoute,
      isTraceNetwork,
      isTraceMemory
    }

    // console.log输出
    consoleLog(this)
    // 点击事件
    if (isOnTapEvent) { proxyComponentsTapEvents(this) }
    // 截屏事件
    if (isOnCaptureScreen) { onUserCaptureScreen(this) }
    // 内存事件
    if (isTraceMemory) { onMemory(this) }
    // 网络状态
    if (isTraceNetwork) { onNetwork(this) }
    // proxyPageEvents(this)
    // rewritePage(this)

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
    // let { url } = config
    // if (~url.indexOf('error-collect')) return // 避免循环上报
    const { statusCode, reqQuery, data: resData } = success
    if (statusCode !== 200) {
      console.log('resData =>', resData)
      this.reportLog({
        errorInfo: resData,
        apiQuery: reqQuery
      })
    }
  }
}
