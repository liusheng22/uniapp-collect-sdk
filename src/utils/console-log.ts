import { CollectLogs } from '../index'

export let log = (...args: any[]) => {
  console.log(...args)
}

export let err = (...args: any[]) => {
  console.error(...args)
}

// 重写 console.log
export function consoleLog(logs: CollectLogs) {
  const oldLog = log
  log = function (...arg) {
    const { isShowLog } = logs.initConfig
    if (isShowLog) {
      oldLog.apply(this, arg)
    }
  }
  err = function (...arg) {
    const { isShowLog } = logs.initConfig
    if (isShowLog) {
      oldLog.apply(this, arg)
    }
  }
}
