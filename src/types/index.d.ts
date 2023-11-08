
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
  // eventType: string
  eventType?: string
  loadOptions?: any
  // id?: string,
  referer?: string
  loadOptions?: any
  extendFields?: any

  errorType?: string
  errorInfo?: any
  params?: any
  requestId?: string
  apiQuery?: string
  isClearLog?: boolean
}

export interface ResConfig {
  data: any
  url: string
}


export interface MpHook {
  [key: string]: boolean
}

export interface InitConfig {
  uniqueId?: string
  sourcePlatform?: string
  customFields: any
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
