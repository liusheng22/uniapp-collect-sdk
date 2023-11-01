import { CollectLogs } from '../index'

export let log = (...args: any[]) => {
  console.log(...args)
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

  // const oldConsoleLog = console.log
  // console.log = function (...arg) {
  //   const { isShowLog } = logs.initConfig
  //   if (isShowLog) {
  //     oldConsoleLog.apply(this, arg)
  //   }
  // }
}
