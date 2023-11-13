
export interface Success {
  statusCode: number
  reqQuery: any
  data: any
}

export interface Fail {
  statusCode: number
  data: any
}

export interface ReportOpts {
  project?: string
  eventType?: string
  libMethod?: string
  eventType?: string
  loadOptions?: any
  referer?: string
  extendFields?: ExtendFields
  extendProps?: ExtendFields
  loadOptions?: any
  customTitle?: string
  requestId?: string
  // 下面的字段逐步移除
  errorType?: string
  errorInfo?: any
  params?: any
  apiQuery?: string
  isClearLog?: boolean
}

export interface CustomReportOpts {
  project: string
  eventType: string
}

export interface ResConfig {
  data: any
  url: string
}


export interface MpHook {
  [key: string]: boolean
}

export interface CustomFields {
  [key: string]: {
    value: string | number | boolean | object
    key: string
  }
}

export interface ExtendFields {
  [key: string]:  string | number | boolean
}

export interface InitConfig {
  uniqueId: string
  serverUrl: string
  project: string
  sourcePlatform: string
  customFields: CustomFields
  isShowLog?: boolean
  isOnAppLifecycle?: boolean
  isOnPageLifecycle?: boolean
  isOnCaptureScreen?: boolean
  isOnTapEvent?: boolean
  isTraceNetwork?: boolean
  isTraceMemory?: boolean
}

export interface PageOpts {
  route: string
  options: any,
  __displayReporter: any
}
