import { requestHeartBeat, requestReportLog } from './report'
import { activityPage, debounce, sleep } from '@/utils'

export const useMixins = () => {
  let previousPage = activityPage().route
  let isIos = false
  // #ifdef APP-PLUS
  isIos = (plus.os.name === 'iOS')
  // #endif

  const mixin = (logs: any, isNvue = false) => {
    const { isOnPageLifecycle } = logs.initConfig

    return {
      methods: {
        nvueLoad(customTitle: string) {
          uni.$emit('collectLogs', {
            lifecycle: 'onShow',
            customTitle,
            referer: previousPage,
            eventType: 'page_view'
          })
        },
        nvueUnload(lifecycle: string) {
          uni.$emit('collectLogs', {
            lifecycle
          })
        }
      },
      onShow: debounce(function (options: any) {
        // #ifdef APP-PLUS
        if (!isOnPageLifecycle) { return }
        if (options) { return }
        console.log('自己创建的mixin onShow')
        const logsRef = this.$refs?.collectLogs || {}
        const title = logsRef.title
        if (isNvue && isIos) {
          return this.nvueLoad(title)
        }
        requestReportLog({
          customTitle: title,
          referer: previousPage,
          eventType: 'page_view'
        }, logs)
        // #endif
      }, 300, true),
      onHide: debounce(async function () {
        // #ifdef APP-PLUS
        if (!isOnPageLifecycle) { return }
        console.log('自己创建的mixin onHide')
        previousPage = activityPage().route
        if (isNvue && isIos) {
          return this.nvueUnload({
            lifecycle: 'onHide'
          })
        }
        requestHeartBeat(logs)
        // #endif
      }, 300, true),
      onUnload() {
        // #ifdef APP-PLUS
        if (!isOnPageLifecycle) { return }
        console.log('自己创建的mixin onUnload')
        previousPage = activityPage().route
        if (isNvue && isIos) {
          return this.nvueUnload({
            lifecycle: 'onUnload'
          })
        }
        requestHeartBeat(logs)
        // #endif
      }
    }
  }

  return mixin
}
