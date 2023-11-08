// @ts-ignore
// eslint-disable-next-line no-useless-escape
import uniPages from 'uni-pages?{\"type\":\"style\"}'
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
import { customFieldsStorageKey, wxb } from '@/constants'
import { consoleLog } from '@/utils/console-log'
import { isNull, isObject, isUndefined } from '@/utils/data-type'
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
    this.request = wxb.request
    this.logList = []
    this.pages = {}
    this.systemInfo = wxb.getSystemInfoSync()
    this.Vue = Vue
    this.initConfig = {
      customFields: {}
    }

    // 监听component的methods
    // proxyComponentsTapEvents(this)
  }

  public init(config: InitConfig) {
    const {
      uniqueId,
      customFields,
      isShowLog = false,
      isOnAppLifecycle = false,
      isOnPageLifecycle = false,
      isOnCaptureScreen = false,
      isOnTapEvent = false,
      isTraceNetwork = false,
      isTraceMemory = false
    } = config
    this.pages = uniPages?.pages || []

    // if (!uniqueId) { throw new Error('缺少必要参数「uniqueId」,需要传入所采集的平台类型') }
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
      isOnAppLifecycle,
      isOnPageLifecycle,
      isTraceNetwork,
      isTraceMemory
    }

    // proxyRequest(this)
    // console.log输出
    consoleLog(this)
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
    // proxyPageEvents(this)

    // 是否页面/应用的开启生命周期监听
    if (isOnAppLifecycle) {
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

  public async updateCustomFields(customFields: object) {
    if (!customFields) {
      if (isUndefined(customFields)) {
        wxb.removeStorageSync(customFieldsStorageKey)
        return
      }
      if (isNull(customFields)) {
        wxb.removeStorageSync(customFieldsStorageKey)
        return
      }
      return Promise.reject('缺少参数，如需清空自定义字段，请不传参数')
    }

    if (!isObject(customFields)) { return Promise.reject('传入参数必须是一个对象') }

    const fieldsData = wxb.getStorageSync(customFieldsStorageKey)
    const currentFields = isObject(fieldsData) ? fieldsData : {}

    const newFields = {
      ...currentFields,
      ...customFields
    }

    wxb.setStorageSync(customFieldsStorageKey, newFields)
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
