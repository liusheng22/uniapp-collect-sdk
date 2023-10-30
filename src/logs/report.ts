import { Logs, activityPage, ReportOpts } from './index'

/**
 * 直接上报相关错误、异常、日志信息
 * @param {Object} 接收上报信息 { errorType, errorInfo, requestId, isClearLog }
 * errorType <String> logInfo:日志信息 / logList: 日志记录 / memory: 内存信息 / onError: Js错误 / apiWarn: api返回非200 / apiError: api请求失败 / apiTimeout: api请求超时 / reportError: 上报失败 / socketError: socket错误
 * errorInfo <String> 错误信息
 * requestId <String> 唯一请求ID
 * isClearLog <Boolean> 上报完后是否清除logList
 * @param {Logs} logs
 */
export function reportLog(
  {
    errorType = 'logInfo',
    errorInfo = '',
    requestId = '',
    userId = '',
    reportPlatform = '',
    apiQuery = ''
  }: ReportOpts,
  logs: Logs
) {
  // 如果采集到到是上报接口，则停止执行，否则会死循环
  // if (typeof errorInfo === 'string' && ~errorInfo.indexOf(this.collectionApiPath)) return
  // 可以不必纠结于「errorInfo」的类型是传入objet还是string
  if (typeof errorInfo === 'object') errorInfo = JSON.stringify(errorInfo)
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

  uniqueId = uniqueId || ('' as string)
  // eslint-disable-next-line
  requestId = `${Date.now()}_${uniqueId.padStart(28, '_').slice(22)}`

  // if (isClearLog && !this.logList.length) return
  // if (isClearLog) errorInfo = JSON.stringify(this.logList)
  // this.logOutput(errorType, errorInfo)
  // if (!this.collectionApi) return
  return new Promise((resolve, reject) => {
    logs.oriRequest({
      url: 'https://test.shuzhikongjian.com/miniapp/biz/log/error-collect',
      method: 'POST',
      header: { isReportRequest: 1 },
      data: { ...info, errorType, errorInfo },
      success: () => resolve({}),
      fail: () => reject(new Error('上报失败'))
    })
  })
}
