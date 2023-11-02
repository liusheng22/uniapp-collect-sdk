import { CollectLogs } from './index'
import { wxb } from '@/constants/index'
import { formatTime } from '@/utils/index'

// 监听用户截屏事件
export function onUserCaptureScreen(logs: CollectLogs) {
  wxb.onUserCaptureScreen(() => {
    logs.reportLog({
      errorType: 'captureScreen',
      errorInfo: '用户截屏事件捕获'
    })
  })
}

/**
 * 当 iOS/Android 向小程序进程发出内存警告时，触发该事件
 * @memberof CollectLogs
 */
export function onMemory(logs: CollectLogs) {
  wxb.onMemoryWarning((error: any) => {
    console.log('errorInfo:', error)
    const memoryLevel = {
      0: '无等级',
      5: '内存轻微',
      10: '内存不足',
      15: '内存临界'
    }
    const { level = '0' } = error
    const errorInfo = memoryLevel[level]
    // Android手机先将错误日志存储到本地，下次进入小程序时再读取相关错误日志，进行上报
    if (
      typeof logs.systemInfo.system === 'string'
      && ~logs.systemInfo.system.indexOf('Android')
    ) {
      // 对本次内存溢出造成闪退的日志信息进行存储
      wxb.setStorageSync('memoryUnusualLogInfo', errorInfo)
      wxb.setStorageSync('unusualLogList', logs.logList)
    } else {
      // 非Android手机直接上报
      logs.reportLog({
        errorType: 'memory',
        errorInfo
      })
      // logs.reportLog({
      //   errorType: 'logList',
      //   isClearLog: true
      // })
    }
  })
}

// 监控网络状态变化
export function onNetwork(logs: CollectLogs) {
  const typeList = {
    wifi: 'wifi 网络',
    '2g': '2g 网络',
    '3g': '3g 网络',
    '4g': '4g 网络',
    ethernet: '有线网络',
    unknown: 'Android 下不常见的网络类型',
    none: '无网络'
  }
  const type2text = (type: string) => {
    if (type) { return typeList[type] } else { return '未知网络' }
  }
  let initNetworkType = ''
  const reportNetwork = (errorInfo: any) => {
    const { networkType } = errorInfo
    const logTime = formatTime()
    const curr = getCurrentPages() || []
    let pagePath = 'loading'
    // this.initNetworkType = networkType
    initNetworkType = networkType
    if (curr.length) {
      const currPage = curr[curr.length - 1] || {}
      pagePath = currPage['route'] || 'unknown'
    }
    // 网络差或无网络情况下，暂时缓存不进行上报
    const networkArr: string[] = ['2g', 'unknown', 'none']
    // if (networkArr.includes(networkType)) {
    if (networkArr.indexOf(networkType) > -1) {
      wxb.setStorageSync('networkUnusualLogInfo', {
        ...errorInfo,
        logTime,
        pagePath
      })
    } else {
      logs.reportLog({
        errorType: 'networkState',
        errorInfo
      })
      const networkInfo = wxb.getStorageSync('networkUnusualLogInfo')
      wxb.removeStorageSync('networkUnusualLogInfo')
      // 对上一次网络异常，可能造成的上报失败进行补上报
      networkInfo
        && logs.reportLog({
          errorType: 'networkState',
          errorInfo: networkInfo
        })
    }
  }
  wxb.getNetworkType({
    success: (net: any) => {
      const { networkType } = net
      reportNetwork({
        networkType,
        networkStatus: type2text(networkType),
        eventType: 'initNetwork'
      })
    }
  })
  wxb.onNetworkStatusChange((net: any) => {
    const { isConnected, networkType } = net
    reportNetwork({
      isConnected,
      networkType,
      networkStatus: type2text(networkType),
      // lastNetwork: this.initNetworkType,
      lastNetwork: initNetworkType,
      eventType: 'switchNetwork'
    })
  })
}

// 最后一次小程序异常情况，再次启动小程序后进行补上报
export function lastUnusualReport(logs: CollectLogs) {
  const errorInfo = wxb.getStorageSync('memoryUnusualLogInfo')
  const logList = wxb.getStorageSync('unusualLogList')
  const networkInfo = wxb.getStorageSync('networkUnusualLogInfo')

  // 对上一次内存溢出，造成闪退存储的日志记录进行上报
  if (logList && logList.length) {
    logs.logList = logList
    // logs.reportLog({
    //   errorType: 'logList',
    //   isClearLog: true
    // }).then(() => wxb.removeStorageSync('unusualLogList'))
  }

  // 对上一次内存溢出，造成闪退存储的内存错误进行上报
  if (errorInfo && typeof errorInfo === 'string') {
    logs
      .reportLog({
        errorType: 'memory',
        errorInfo
      })
      .then(() => wxb.removeStorageSync('memoryUnusualLogInfo'))
  }

  // 对上一次网络异常，可能造成的上报失败进行补上报
  networkInfo
    && logs
      .reportLog({
        errorType: 'networkState',
        errorInfo: networkInfo
      })
      .then(() => wxb.removeStorageSync('networkUnusualLogInfo'))
}
