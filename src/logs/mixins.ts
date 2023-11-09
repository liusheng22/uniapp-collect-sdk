import { requestHeartBeat, requestReportLog } from './report'
import { activityPage, debounce } from '@/utils'

export const useMixins = () => {
  let previousPage = activityPage().route

  const mixin = (logs: any, isNvue = false) => {
    const { isOnPageLifecycle } = logs.initConfig
    return {
      /**
       * 生命周期函数--监听页面显示
       * - app-plus平台: options为onAppShow事件的参数，但是APP没有onAppShow事件
       * - app-plus平台：onAppShow事件由onShow事件代替了，例:APP启动时onShow会触发2次
       * - 所以通过判断options的值是否为undefined，来确定是否为onAppShow事件
       */
      onShow(options: any) {
        // #ifdef APP-PLUS
        if (!isOnPageLifecycle) { return }
        if (options) { return }
        console.log('自己创建的mixin onShow')
        if (isNvue) {
          return uni.$emit('collectLogs', {
            lifecycle: 'onShow',
            referer: previousPage,
            eventType: 'page_view'
          })
        }
        requestReportLog({
          referer: previousPage,
          eventType: 'page_view'
        }, logs)
        // #endif
      },
      /**
       * 生命周期函数--监听页面隐藏
       * - app-plus平台：onAppHide事件由onHide事件代替了，例:APP隐藏时onHide会触发2次
       * - 所以通过防抖函数来过滤掉onHide事件的一次触发
       */
      onHide: debounce(async function () {
        // #ifdef APP-PLUS
        if (!isOnPageLifecycle) { return }
        console.log('自己创建的mixin onHide')
        previousPage = activityPage().route
        requestHeartBeat(logs)
        // #endif
      }, 300, true),
      onUnload() {
        // #ifdef APP-PLUS
        if (!isOnPageLifecycle) { return }
        console.log('自己创建的mixin onUnload')
        previousPage = activityPage().route
        requestHeartBeat(logs)
        // #endif
      }
    }
  }

  return mixin
}
