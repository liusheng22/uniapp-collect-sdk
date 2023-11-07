import { CollectLogs } from './index'
import { wxb } from '@/constants/index'
import { activityPage, formatTime } from '@/utils/index'
import { canIUse } from '@/utils/uni-api'

export function onApp(logs: CollectLogs) {
  if (canIUse('onAppShow')) {
    wxb.onAppShow(() => {
      onAppShowReport(logs)
    })
  }

  if (canIUse('onAppHide')) {
    wxb.onAppHide(() => {
      onAppHideReport(logs)
    })
  }

  if (canIUse('onPageNotFound')) {
    wxb.onPageNotFound((errorInfo: any) => {
      logs.reportLog({
        errorType: 'notFount',
        errorInfo
      })
    })
  }
}

export function startInterval(logs: CollectLogs) {
  logs.vueApp.timer = setInterval(() => {
    ++logs.vueApp.seconds
  }, 1000)
}

// 应用切到前台时
export function onAppShowReport(logs: CollectLogs) {
  // console.log('onAppShowReport')
  // let curr = logs.activityPage
  // let curr = activityPage
  logs.vueApp.entryPages = activityPage().route || 'loading'
  logs.vueApp.entryDate = formatTime()
  if (logs.vueApp.timer) {
    clearInterval(logs.vueApp.timer)
    logs.vueApp.timer = null
    logs.vueApp.seconds = 0
    startInterval(logs)
  } else {
    startInterval(logs)
  }
}

// 应用切到后台时
export function onAppHideReport(logs: CollectLogs) {
  // console.log('onAppHideReport')
  logs.vueApp.leavePages = activityPage().route || 'loading'
  logs.vueApp.leaveDate = formatTime()
  const { seconds, entryPages, leavePages, entryDate, leaveDate } = logs.vueApp
  logs.reportLog({
    errorType: 'stayTime',
    errorInfo: { seconds, entryPages, leavePages, entryDate, leaveDate }
  })
  clearInterval(logs.vueApp.timer)
  logs.vueApp.timer = null
  logs.vueApp.seconds = 0
  // this.startInterval()
}
