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

// 存自定义字段的key - 仅用于查看
export const customFieldsStorageKey = 'UNIAPP_COLLECT_SDK_SUPPLEMENT_CUSTOM_FIELDS'
// 存uuid的key - 仅用于查看
export const uuidStorageKey = 'UNIAPP_COLLECT_SDK_UUID'

