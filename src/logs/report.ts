import { ReportOpts } from '../types'
import { CollectLogs } from '.'
import { apiUrls } from '@/constants/api'
import { activityPage, getAppCurrPageView, getPageInfo, sleep } from '@/utils'
import { getCustomFields } from '@/utils'
import { log, err } from '@/utils/console-log'
import { isObject, type } from '@/utils/data-type'
import { formatLibType } from '@/utils/params'
import { getNetworkType } from '@/utils/uni-api'
import { getUuid, setUuid, uuid } from '@/utils/uuid'
import { validateParams } from '@/utils/validate'

/**
 * 上报日志
 * @param {ReportOpts} opts 上报参数
 * @param {CollectLogs} logs 日志实例
 * @returns {Promise<any>} 上报结果
 * @example requestReportLog({ eventType: 'event_name' }, logs)
 */
export async function requestReportLog(
  opts: ReportOpts,
  logs: CollectLogs,
): Promise<any> {
  const {
    referer,
    customTitle,
    eventType = '',
    libMethod = '',
    extendFields = {},
    extendProps = {},
    project: optProject
  } = opts
  let { requestId = '' } = opts
  // 校验字段
  const [validate, error] = validateParams(logs.initConfig)
  if (!validate) {
    const msg = `埋点error:${error}`
    err(msg)
    return Promise.reject(msg)
  }
  if (extendFields && !isObject(extendFields)) {
    const msg = '埋点error:「extendFields」必须是一个对象'
    err(msg)
    return Promise.reject(msg)
  }
  if (extendProps && !isObject(extendProps)) {
    const msg = `埋点error:「customReport」方法调用失败，自定义上报的属性不可以是一个${type(extendProps)}`
    err(msg)
    return Promise.reject(msg)
  }
  if (!eventType) {
    const msg = '埋点error:「eventType」必须是一个字符串或缺少该字段'
    err(msg)
    return Promise.reject(msg)
  }

  const { uniqueId, sourcePlatform, serverUrl, project, customFields = { } } = logs.initConfig

  let fieldsData = {}
  if (customFields && !isObject(customFields)) {
    const msg = '埋点error:「customFields」必须是一个对象'
    err(msg)
    return Promise.reject(msg)
  } else if (customFields && isObject(customFields)) {
    fieldsData = {
      ...extendFields,
      ...getCustomFields(customFields),
      ...extendProps
    }
  }

  const networkType = getNetworkType()
  requestId = `${Date.now()}_${uniqueId}`

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
    uniPlatform,
    windowHeight,
    windowWidth
  } = logs.systemInfo
  const { route, options, __displayReporter } = activityPage()
  const query = options || __displayReporter?.query || {}
  const pagePath = route || 'unknown'
  const pageQuery = JSON.stringify(query)
  const libType = formatLibType(uniPlatform, osName)
  await sleep(500)
  const reportId = eventType === 'page_view' ? setUuid(logs) : uuid()

  const baseParams = {
    id: reportId,
    request_id: requestId,
    distinct_id: uniqueId,
    event: eventType,
    project: optProject || project,
    type: 'track'
  }
  const lib = {
    lib: libType,
    lib_detail: '',
    lib_method: libMethod || 'AUTO',
    lib_version: 'v2.0.7'
  }
  const { navigationBarTitleText } = getPageInfo(logs.pages, pagePath)
  const { titleText } = getAppCurrPageView()

  // 获取用户后续补充的自定义字段
  const fieldData = logs.supplementFields
  const supplementFields = isObject(fieldData) ? fieldData : {}
  const pageTitle = navigationBarTitleText || titleText || customTitle
  const properties = {
    source_platform: sourcePlatform,
    page_title: pageTitle,
    page_id: pagePath,
    page_query: pageQuery,
    referer,
    avail_width: windowWidth,
    avail_height: windowHeight,
    duration_times: 0,
    ...supplementFields,
    ...fieldsData
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

  log('上报数据:', {
    ...baseParams,
    properties
  })

  return new Promise((resolve, reject) => {
    logs.request({
      url: `${serverUrl}${apiUrls.report}`,
      method: 'POST',
      header: { isReportRequest: 1 },
      data: { events: [eventObj] },
      success: () => resolve({}),
      fail: () => reject(new Error('上报失败'))
    })
  })
}

export const requestHeartBeat = (logs: CollectLogs) => {
  const { serverUrl } = logs.initConfig
  const eventIds = getUuid(logs)
  logs.request({
    url: serverUrl + apiUrls.heartBeat,
    method: 'GET',
    header: { isReportRequest: 1 },
    data: {
      eventIds,
      reportType: 1
    },
    success: () => {
      log(`心跳上报成功: ${eventIds}`)
    },
    fail: () => {
      log('心跳上报失败')
    }
  })
}
