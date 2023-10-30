import { Logs } from './index'
import { wxb } from '@/constants/index'

/**
 * 监听小程序onError事件
 * @memberof Logs
 */
export function onError(logs: Logs) {
  wxb.onError((errorInfo: any) => {
    logs.report({
      errorType: 'onError',
      errorInfo
    })
    // logs.report({
    //   errorType: 'logList',
    //   isClearLog: true
    // })
  })
}
