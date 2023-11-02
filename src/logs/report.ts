import { ReportOpts } from '../types'
import { CollectLogs } from '.'
import { apiUrls } from '@/constants/api'
import { activityPage, getPageInfo } from '@/utils'
import { log } from '@/utils/console-log'
import { getUuid } from '@/utils/uuid'

/**
 * 直接上报相关错误、异常、日志信息
 * @param {Object} 接收上报信息 { errorType, errorInfo, requestId, isClearLog }
 * errorType <String> logInfo:日志信息 / logList: 日志记录 / memory: 内存信息 / onError: Js错误 / apiWarn: api返回非200 / apiError: api请求失败 / apiTimeout: api请求超时 / reportError: 上报失败 / socketError: socket错误
 * errorInfo <String> 错误信息
 * requestId <String> 唯一请求ID
 * isClearLog <Boolean> 上报完后是否清除logList
 * @param {CollectLogs} logs
 */
export function requestReportLog(
  {
    id = '',
    eventType,
    errorType = 'logInfo',
    errorInfo = '',
    requestId = '',
    userId = '',
    reportPlatform = '',
    apiQuery = ''
  }: ReportOpts,
  logs: CollectLogs
) {
  // 如果采集到到是上报接口，则停止执行，否则会死循环
  // if (typeof errorInfo === 'string' && ~errorInfo.indexOf(this.collectionApiPath)) return
  // 可以不必纠结于「errorInfo」的类型是传入objet还是string
  if (typeof errorInfo === 'object') { errorInfo = JSON.stringify(errorInfo) }
  const initConfig = logs.initConfig
  // let storeOpenId = wxb.getStorageSync('openId')
  let { uniqueId } = initConfig
  const { platform: currPlatform } = initConfig
  uniqueId = userId || uniqueId || 'unknown'
  const platform = reportPlatform || currPlatform || 'unknown'
  const {
    SDKVersion = '无',
    version = '无',
    system = '无',
    model = '无',
    brand = '无'
  } = logs.systemInfo
  const pagePath = activityPage().route || 'loading'
  let params = ''
  const options = activityPage().options || {}
  activityPage().route
  activityPage().options
  params = JSON.stringify(options)
  const info = {
    uniqueId,
    platform,
    pagePath,
    params,
    apiQuery,
    requestId,
    systemInfo: `引擎版本号:${version}, 操作系统:${system}, 手机型号:${model}, 手机品牌: ${brand}`,
    basicVersion: SDKVersion
  }

  if (!eventType) {
    return Promise.reject(new Error('eventType is required'))
  }

  uniqueId = uniqueId || ('' as string)
  // eslint-disable-next-line
  requestId = `${Date.now()}_${uniqueId.padStart(28, "_").slice(22)}`;

  // if (isClearLog && !this.logList.length) return
  // if (isClearLog) errorInfo = JSON.stringify(this.logList)
  // this.logOutput(errorType, errorInfo)
  // if (!this.collectionApi) return

  const lib = {
    lib: 'UNIAPP',
    lib_detail: '',
    lib_method: 'AUTO',
    lib_version: 'v2.0.7'
  }
  const { navigationBarTitleText } = getPageInfo(logs.pages, pagePath)
  const properties = {
    project_account: '',
    group_account: '',
    page_title: navigationBarTitleText,
    page_id: pagePath
  }
  const baseParams = {
    id,
    distinct_id: uniqueId,
    event: eventType,
    project: 'product_basic',
    type: 'track'
  }
  const data = {
    ...baseParams,
    properties,
    lib
  }
  log('上报数据:', baseParams, properties)

  return new Promise((resolve, reject) => {
    logs.request({
      // url: 'https://www.fastmock.site/mock/6345ad1b8161c2b06ef04f23db6c1b1e/mock/post',
      url: apiUrls.report,
      method: 'POST',
      header: { isReportRequest: 1 },
      // data: { ...info, errorType, errorInfo },
      data,
      success: () => resolve({}),
      fail: () => reject(new Error('上报失败'))
    })
  })
}

export const requestHeartBeat = (logs: CollectLogs) => {
  logs.request({
    url: apiUrls.heartBeat,
    method: 'GET',
    header: { isReportRequest: 1 },
    data: {
      eventIds: getUuid(),
      reportType: 1
    },
    success: () => {
      console.log('心跳上报成功')
    },
    fail: () => {
      console.log('心跳上报失败')
    }
  })
}
