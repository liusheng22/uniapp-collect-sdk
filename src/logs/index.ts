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
import { useMixins } from './mixins'
import { onApp } from './onApp'
import { onError } from './onError'
import { requestHeartBeat, requestReportLog } from './report'
import { ReportOpts, InitConfig, Success, ResConfig, ExtendFields, CustomReportOpts, UniSystemInfoResult, keyValue } from '../types'
import { customFieldsStorageKey, wxb, defaultConfig } from '@/constants'
import { deepClone } from '@/utils/clone'
import { err, log } from '@/utils/console-log'
import { isNull, isObject, isUndefined } from '@/utils/data-type'
import { validateParams } from '@/utils/validate'

export class CollectLogs {
  private static instance: CollectLogs | null = null

  public request = wxb.request
  public pages: any
  public logList: Array<ReportOpts>
  public systemInfo: GetSystemInfoResult & UniSystemInfoResult
  public initConfig: InitConfig
  public supplementFields: keyValue
  public vueApp: any
  public vue: Vue.VueConstructor
  public uuid: string
  public isInit = false

  constructor(vue: Vue.VueConstructor) {
    if (CollectLogs.instance) {
      err('CollectLogs实例已存在')
      return CollectLogs.instance
    }
    // 初始化实例
    CollectLogs.instance = this

    this.logList = []
    this.pages = {}
    this.systemInfo = wxb.getSystemInfoSync()
    this.vue = vue
    this.uuid = ''
    this.initConfig = defaultConfig
    this.supplementFields = {}
    vue.prototype.$collectLogs = this
  }

  public init(config: InitConfig) {
    // 是否已经存在
    if (this.isInit) {
      const msg = '埋点已经初始化'
      log(msg)
      return Promise.reject(msg)
    }
    this.isInit = true
    this.pages = uniPages?.pages || []
    this.vueApp = {}

    this.initConfig = { ...this.initConfig, ...config }
    // 校验字段
    const [validate, error] = validateParams(this.initConfig)

    if (!validate) {
      const msg = `埋点初始化失败：${error}`
      log(msg)
      return Promise.reject(msg)
    }
    const { isOnTapEvent, isOnPageLifecycle, isOnCaptureScreen, isTraceMemory, isOnAppLifecycle, isTraceNetwork } = this.initConfig

    this.listenerNvueLifecycle()
    // 点击事件/路由事件
    proxyComponentsEvents({
      isOnTapEvent,
      isOnPageLifecycle
    }, this)
    // 截屏事件
    if (isOnCaptureScreen) { onUserCaptureScreen(this) }
    // 内存事件
    if (isTraceMemory) { onMemory(this) }
    // 网络状态
    if (isTraceNetwork) { onNetwork(this) }

    // 是否页面/应用的开启生命周期监听
    if (isOnAppLifecycle) {
      onApp(this)
      onError(this)
      lastUnusualReport(this)
    }

    log('埋点初始化成功')
    return Promise.resolve()
  }

  // 自定义上报方法
  public async customReport(opts: CustomReportOpts, properties: ExtendFields = {} ) {
    return new Promise((resolve, reject) => {
      const that = getApp().globalData.collectLogs || this
      requestReportLog({ ...opts, libMethod: 'CODE', extendProps: properties }, that )
        .then((data: any) => {
          resolve(data)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  public async reportLog(obj: ReportOpts, logs: CollectLogs = this) {
    const { eventType } = obj || {}
    const { isOnTapEvent } = logs.initConfig || {}
    if (eventType === 'button_click' && !isOnTapEvent) {
      return
    }
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

  // 上报心跳
  public reportHeartBeat(logs: CollectLogs = this) {
    requestHeartBeat(logs)
  }

  public lifecycleMixin() {
    const appCollectLogs = getApp().globalData.collectLogs || this
    const mixins = useMixins()
    const logsMixin = mixins(appCollectLogs, true)
    return logsMixin
  }

  public listenerNvueLifecycle() {
    wxb.$on('collectLogs', (data: any) => {
      const nvueCollectLogs = getApp().globalData.collectLogs || this
      switch (data.lifecycle) {
        case 'onShow':
          nvueCollectLogs.reportLog({
            ...data
          })
          break
        case 'onHide':
        case 'onUnload':
          nvueCollectLogs.reportHeartBeat()
          break
      }
    })
  }

  /**
   * 更新自定义字段
   * @param customFields 自定义字段
   * @returns {Promise<any>} 更新结果
   */
  public async updateCustomFields(customFields: object): Promise<any> {
    const that = getApp().globalData.collectLogs || this

    if (!customFields) {
      if (isUndefined(customFields)) {
        wxb.removeStorageSync(customFieldsStorageKey)
        that.supplementFields = {}
        return
      }
      if (isNull(customFields)) {
        wxb.removeStorageSync(customFieldsStorageKey)
        that.supplementFields = {}
        return
      }

      const msg = '埋点error:「updateCustomFields」函数调用失败，缺少参数，如需清空自定义字段，请不传参数'
      err(msg)
      return Promise.reject(msg)
    }

    if (!isObject(customFields)) {
      const msg = '埋点error:「updateCustomFields」函数调用失败，传入参数必须是一个对象'
      err(msg)
      return Promise.reject(msg)
    }

    const fieldsData = deepClone(that.supplementFields)
    const currentFields = isObject(fieldsData) ? fieldsData : {}
    const newFields = {
      ...currentFields,
      ...customFields
    }

    wxb.setStorageSync(customFieldsStorageKey, newFields)
    that.supplementFields = newFields

    return newFields
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
