import { requestHeartBeat, requestReportLog } from './report'
import { CollectLogs } from '.'
import { wxb } from '@/constants'
import { activityPage, debounce, sleep } from '@/utils'

export const useMixins = () => {
  let previousPage = activityPage().route
  let isIos = false
  // #ifdef APP-PLUS
  isIos = (plus.os.name === 'iOS')
  // #endif

  const mixin = (logs: CollectLogs, isNvue = false, titleKey = 'title') => {
    const { isOnPageLifecycle } = logs.initConfig

    return {
      data() {
        return {
          logsCustomTitle: ''
        }
      },
      methods: {
        tapEventReport(params: any) {
          // this.$collectLogs.customReport(params)
          const customTitle = this.logsCustomTitle || this[titleKey] || ''
          this.$collectLogs.reportLog({
            ...params,
            customTitle
          })
        },
        updateCustomTitle(title: string) {
          this.logsCustomTitle = title
        },
        nvueLoad(customTitle: string) {
          wxb.$emit('collectLogs', {
            lifecycle: 'onShow',
            customTitle,
            referer: previousPage,
            eventType: 'page_view'
          })
        },
        nvueUnload(lifecycle: string) {
          wxb.$emit('collectLogs', {
            lifecycle
          })
        }
      },
      onShow: debounce(async function (options: any) {
        // #ifdef APP-PLUS
        await sleep(300)
        if (!isOnPageLifecycle) { return }
        if (options) { return }
        const customTitle = this.logsCustomTitle || this[titleKey] || ''
        if (isNvue && isIos) {
          return this.nvueLoad(customTitle)
        }
        requestReportLog({
          customTitle,
          referer: previousPage,
          eventType: 'page_view'
        }, logs)
        // #endif
      }, 300, true),
      onHide: debounce(async function () {
        // #ifdef APP-PLUS
        if (!isOnPageLifecycle) { return }
        previousPage = activityPage().route
        if (isNvue && isIos) {
          return this.nvueUnload('onHide')
        }
        requestHeartBeat(logs)
        // #endif
      }, 300, true),
      onUnload() {
        // #ifdef APP-PLUS
        if (!isOnPageLifecycle) { return }
        previousPage = activityPage().route
        if (isNvue && isIos) {
          return this.nvueUnload('onUnload')
        }
        requestHeartBeat(logs)
        // #endif
      }
    }
  }

  return mixin
}
