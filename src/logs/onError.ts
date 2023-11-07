import { CollectLogs } from './index'
import { wxb } from '@/constants/index'
import { canIUse } from '@/utils/uni-api'

/**
 * 监听小程序onError事件
 * @memberof CollectLogs
 */
export function onError(logs: CollectLogs) {
  if (canIUse('onError')) {
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
}
