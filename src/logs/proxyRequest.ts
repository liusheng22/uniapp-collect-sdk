import { CollectLogs } from './index'

export function proxyRequest(logs: CollectLogs) {
  Object.defineProperty(wx, 'request', {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function (...arg: any[]) {
      // const args = arguments[0] || {}
      const args = arg[0] || {}
      const {
        data,
        header: { isReportRequest }
      } = args
      const originSuccess = args.success
      const originFail = args.fail
      // 直接发送请求，不上报
      console.log('监听上报数据 ===>', args)
      args.success = function (...sucsArgs: any) {
        console.log('success', sucsArgs)
        const [success] = sucsArgs
        success.reqQuery = data
        if (!isReportRequest) { logs.successResponse(success, args) }
        originSuccess.call(this, ...sucsArgs)
      }

      args.fail = function (...failArgs: any) {
        console.log('fail', failArgs)
        originFail.call(this, ...failArgs)
      }
      return logs.oriRequest.apply(this, arg)
    }
  })
}
