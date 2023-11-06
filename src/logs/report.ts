import { ReportOpts } from '../types'
import { CollectLogs } from '.'
import { wxb } from '@/constants'
import { apiUrls } from '@/constants/api'
import { activityPage, getAppCurrPageView, getPageInfo } from '@/utils'
import { log } from '@/utils/console-log'
import { isObject } from '@/utils/data-type'
import { formatLibType } from '@/utils/params'
import { getUuid, setUuid } from '@/utils/uuid'

/**
 * 直接上报相关错误、异常、日志信息
 * @param {Object} 接收上报信息 { errorType, errorInfo, requestId, isClearLog }
 * errorType <String> logInfo:日志信息 / logList: 日志记录 / memory: 内存信息 / onError: Js错误 / apiWarn: api返回非200 / apiError: api请求失败 / apiTimeout: api请求超时 / reportError: 上报失败 / socketError: socket错误
 * errorInfo <String> 错误信息
 * requestId <String> 唯一请求ID
 * isClearLog <Boolean> 上报完后是否清除logList
 * @param {CollectLogs} logs
 */
export async function requestReportLog(
  opts: ReportOpts,
  logs: CollectLogs
) {

  const {
    id = '',
    eventType,
    referer,

    errorType = 'logInfo',
    userId = '',
    reportPlatform = '',
    apiQuery = ''
  } = opts
  let {
    extendFields,
    requestId = '',
    errorInfo = ''
  } = opts

  // 校验 extendFields
  extendFields = extendFields || {}
  if (!isObject(extendFields)) {
    extendFields = {}
    log('「extendFields」必须是一个对象')
  }

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
  const { networkType } = await wxb.getNetworkType()
  const {
    brand,
    model,
    platform: osPlatform,
    system,
    screenWidth,
    screenHeight,
    wifiEnabled,
    deviceId,
    deviceOrientation,
    osName,
    uniPlatform
  } = logs.systemInfo
  const { route, options, __displayReporter } = activityPage()
  const query = options || __displayReporter?.query || {}
  const pagePath = route || 'unknown'
  const pageQuery = JSON.stringify(query)
  // const info = {
  //   uniqueId,
  //   platform,
  //   pagePath,
  //   apiQuery,
  //   requestId,
  //   systemInfo: `引擎版本号:${version}, 操作系统:${system}, 手机型号:${model}, 手机品牌: ${brand}`,
  //   basicVersion: SDKVersion
  // }

  if (!eventType) {
    return Promise.resolve({})
  }

  uniqueId = uniqueId || ('' as string)
  // eslint-disable-next-line
  requestId = `${Date.now()}_${uniqueId.padStart(28, "_").slice(22)}`;

  // if (isClearLog && !this.logList.length) return
  // if (isClearLog) errorInfo = JSON.stringify(this.logList)
  // this.logOutput(errorType, errorInfo)
  // if (!this.collectionApi) return

  const { windowHeight, windowWidth } = logs.systemInfo
  const libType = formatLibType(uniPlatform, osName)

  const baseParams = {
    // id: setUuid(),
    id,
    distinct_id: uniqueId,
    event: eventType,
    project: 'product_basic',
    type: 'track'
  }
  const lib = {
    lib: libType,
    lib_detail: '',
    lib_method: 'AUTO',
    lib_version: 'v2.0.7'
  }
  const { navigationBarTitleText } = getPageInfo(logs.pages, pagePath)
  const { titleText } = getAppCurrPageView()

  const properties = {
    project_account: '',
    group_account: '',
    page_title: navigationBarTitleText || titleText,
    page_id: pagePath,
    page_query: pageQuery,
    referer,
    avail_width: windowWidth,
    avail_height: windowHeight,
    ...extendFields
  }
  // 设备信息
  const deviceInfo = {
    manufacturer: brand,
    model,
    os: osPlatform,
    os_version: system,
    screen_height: screenHeight,
    screen_width: screenWidth,
    wifi: wifiEnabled,
    network_type: networkType,
    device_id: deviceId,
    screen_orientation: deviceOrientation
  }
  const eventObj = {
    ...baseParams,
    ...deviceInfo,
    properties,
    lib
  }

  console.log('--------> 上报数据:')
  console.log(JSON.stringify(eventObj))
  log('上报数据:', baseParams, properties)

  return new Promise((resolve, reject) => {
    logs.request({
      // url: 'https://www.fastmock.site/mock/6345ad1b8161c2b06ef04f23db6c1b1e/mock/post',
      url: apiUrls.report,
      method: 'POST',
      header: { isReportRequest: 1 },
      // data: { ...info, errorType, errorInfo },
      data: { events: [eventObj] },
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
