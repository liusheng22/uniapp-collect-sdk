import { ReportOpts } from '../types'
import { CollectLogs } from '.'
import { customFieldsStorageKey, wxb } from '@/constants'
import { apiUrls } from '@/constants/api'
import { activityPage, getAppCurrPageView, getPageInfo } from '@/utils'
import { log } from '@/utils/console-log'
import { isObject } from '@/utils/data-type'
import { formatLibType } from '@/utils/params'
import { getUuid, setUuid } from '@/utils/uuid'
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
  logs: CollectLogs
): Promise<any> {
  const { eventType, referer } = opts
  let { extendFields = {}, requestId = '' } = opts

  // 校验字段
  if (!isObject(extendFields)) {
    extendFields = {}
    throw new Error('「extendFields」必须是一个对象')
  }
  const [validate, error] = validateParams(logs.initConfig)
  if (validate) {
    throw new Error(error)
  }

  const { uniqueId, sourcePlatform } = logs.initConfig
  requestId = `${Date.now()}_${uniqueId}`

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

  if (!eventType) {
    return Promise.resolve({})
  }

  const { windowHeight, windowWidth } = logs.systemInfo
  const libType = formatLibType(uniPlatform, osName)

  const baseParams = {
    id: setUuid(),
    source_platform: sourcePlatform,
    // id,
    request_id: requestId,
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

  // 获取用户后续补充的自定义字段
  const fieldsData = wxb.getStorageSync(customFieldsStorageKey)
  const supplementFields = isObject(fieldsData) ? fieldsData : {}
  const properties = {
    project_account: '',
    group_account: '',
    page_title: navigationBarTitleText || titleText,
    page_id: pagePath,
    page_query: pageQuery,
    referer,
    avail_width: windowWidth,
    avail_height: windowHeight,
    ...extendFields,
    ...supplementFields
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
