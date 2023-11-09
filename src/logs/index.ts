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
import { mixins } from './mixins'
import { onApp } from './onApp'
import { onError } from './onError'
import { requestReportLog } from './report'
import { ReportOpts, InitConfig, Success, ResConfig, ExtendFields } from '../types'
import { customFieldsStorageKey, wxb, defaultConfig } from '@/constants'
import { deepClone } from '@/utils/clone'
import { log } from '@/utils/console-log'
import { isNull, isObject, isUndefined } from '@/utils/data-type'
import { validateParams } from '@/utils/validate'

export class CollectLogs {
  private static instance: CollectLogs | null = null

  public request: any
  public pages: any
  public logList: Array<ReportOpts>
  public systemInfo: any
  public initConfig: InitConfig
  public supplementFields: any
  public vueApp: any
  public Vue: any
  public mixin: any

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
    this.supplementFields = {}

    // 监听component的methods
    // proxyComponentsTapEvents(this)

    // const useMixins = mixins(this)
    // this.mixin = useMixins()
  }

  public init(config: InitConfig) {
    // const useMixins = mixins(this)
    // this.mixin = useMixins()
    this.uniOn(this)

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

    log('埋点初始化成功')
    return Promise.resolve()
  }

  // 自定义上报方法
  public async customReport(opts: { project: string, eventType: string }, properties: ExtendFields = {} ) {
    return new Promise((resolve, reject) => {
      requestReportLog({ ...opts, libMethod: 'CODE', extendFields: properties }, this )
        .then((data: any) => {
          resolve(data)
        })
        .catch((err) => {
          reject(err)
        })
    })
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

  /**
   * 更新自定义字段
   * @param customFields 自定义字段
   * @returns {Promise<any>} 更新结果
   */
  public async updateCustomFields(customFields: object): Promise<any> {
    if (!customFields) {
      if (isUndefined(customFields)) {
        wxb.removeStorageSync(customFieldsStorageKey)
        this.supplementFields = {}
        return
      }
      if (isNull(customFields)) {
        wxb.removeStorageSync(customFieldsStorageKey)
        this.supplementFields = {}
        return
      }
      return Promise.reject('缺少参数，如需清空自定义字段，请不传参数')
    }

    if (!isObject(customFields)) { return Promise.reject('传入参数必须是一个对象') }

    const fieldsData = deepClone(this.supplementFields)
    const currentFields = isObject(fieldsData) ? fieldsData : {}
    const newFields = {
      ...currentFields,
      ...customFields
    }

    wxb.setStorageSync(customFieldsStorageKey, newFields)
    this.supplementFields = newFields

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

  public uniOn(that) {
    console.log('----------初始化--------')
    uni.$on('test', () => {
      console.log('==========接受事件===========')
      this.reportLog({
        eventType: '00000000'
      })
    })
  }

  public uniEmit() {
    console.log('==========出发===========')
    uni.$emit('on')
  }

  // mixin
  public getMixin() {
    // return this.mixin
    const useMixins = mixins()
    this.mixin = useMixins(this)
    return this.mixin
  }
}
