// import { CollectLogs } from 'wxb-uniapp-collect-sdk'
import Vue from 'vue'
import { CollectLogs } from '../../../../../bin/index'
export const collectLogs = new CollectLogs(Vue)
// export const logsMixin = collectLogs.getMixin() || {}

// eslint-disable-next-line
export const logsMixin = {}
export const useGlobalApp = () => {
  const mixin = () => {
    // eslint-disable-next-line no-undef
    const appCollectLogs = getApp().globalData.collectLogs || collectLogs
    const logsMixin = appCollectLogs.getMixin() || {}
    return logsMixin
  }

  return mixin
}
// const appCollectLogs = app.globalData.collectLogs || collectLogs
// export const logsMixin = appCollectLogs.getMixin() || {}
