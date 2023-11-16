import { CollectLogs } from './index'
import { wxb } from '@/constants'

export function proxyRequest(logs: CollectLogs) {
  Object.defineProperty(logs, 'request', {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function (...arg: any[]) {
      // console.log('proxyRequest', arg)
      // const args = arguments[0] || {}
      const args = arg[0] || {}
      const {
        data,
        header
      } = args
      const { isReportRequest } = header || {}

      const originSuccess = args.success
      const originFail = args.fail
      // 直接发送请求，不上报
      console.log('监听上报数据 ===>', args)

      args.success = function (...sucsArgs: any) {
        console.log('success', sucsArgs)
        const [success] = sucsArgs
        success.reqQuery = data
        if (!isReportRequest) { logs.successResponse(success, args) }

        return originSuccess.apply(this, sucsArgs)
      }

      args.fail = function (...failArgs: any) {
        console.log('fail', failArgs)

        return originFail.apply(this, failArgs)
      }

      // return logs.request.apply(this, arg)
    }
  })
}
