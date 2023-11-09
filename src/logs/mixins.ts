import { requestHeartBeat, requestReportLog } from './report'
import { activityPage, debounce } from '@/utils'

let previousPage = activityPage().route
const isOnPageLifecycle = true

export const mixins = () => {
  const mixin = (logs: any) => {
    return {
      /**
         * 生命周期函数--监听页面显示
         * - app-plus平台: options为onAppShow事件的参数，但是APP没有onAppShow事件
         * - app-plus平台：onAppShow事件由onShow事件代替了，例:APP启动时onShow会触发2次
         * - 所以通过判断options的值是否为undefined，来确定是否为onAppShow事件
         */
      onShow(options: any) {
        uni.showModal({
          title: 'mix---onShow',
          content: activityPage().route,
          showCancel: true
        })
        console.log('自己创建的mixin onShow')
        // #ifdef APP-PLUS
        uni.$emit('test')
        return
        if (!isOnPageLifecycle) { return }
        if (options) { return }
        console.log('------logs----->>>', logs.initConfig)
        requestReportLog({
          referer: previousPage,
          eventType: 'page_view'
        }, logs)
        // #endif

      },
      // onShow: debounce(async function (e) {
      //   await sleep(100)
      //   if (!isOnPageLifecycle) { return }
      //   console.log('自己创建的mixin onShow')
      //   requestReportLog({
      //     referer: previousPage,
      //     eventType: 'page_view'
      //   }, logs)
      // }, 300, true),
      /**
       * 生命周期函数--监听页面隐藏
       * - app-plus平台：onAppHide事件由onHide事件代替了，例:APP隐藏时onHide会触发2次
       * - 所以通过防抖函数来过滤掉onHide事件的一次触发
       */
      onHide: debounce(async function () {
        uni.showModal({
          title: 'mix--onHide',
          content: activityPage().route,
          showCancel: true
        })
        // #ifdef APP-PLUS
        if (!isOnPageLifecycle) { return }
        console.log('自己创建的mixin onHide')
        previousPage = activityPage().route
        requestHeartBeat(logs)
        // #endif

      }, 300, true),
      onUnload() {
        uni.showModal({
          title: 'mix--onUnload',
          content: activityPage().route,
          showCancel: true
        })
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
