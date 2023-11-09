import { InitConfig } from '@/types'

export const wxb = uni || wx || tt

// 默认参数
export const defaultConfig: InitConfig = {
  uniqueId: '',
  serverUrl: '',
  project: '',
  customFields: {},
  sourcePlatform: '',
  isShowLog: false,
  isOnAppLifecycle: false,
  isOnPageLifecycle: false,
  isOnCaptureScreen: false,
  isOnTapEvent: false,
  isTraceNetwork: false,
  isTraceMemory: false
}
