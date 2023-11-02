import { CollectLogs } from './index'
import { wxb } from '@/constants/index'

/**
 * 监听小程序onError事件
 * @memberof CollectLogs
 */
export function onError(logs: CollectLogs) {
  wxb.onError((errorInfo: any) => {
    logs.reportLog({
      errorType: 'onError',
      errorInfo
    })
    // logs.reportLog({
    //   errorType: 'logList',
    //   isClearLog: true
    // })
  })
}
