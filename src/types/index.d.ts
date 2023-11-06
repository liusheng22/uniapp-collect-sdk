
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
  id?: string,
  referer?: string
  loadOptions?: any
  extendFields?: any

  errorType?: string
  errorInfo?: any
  params?: any
  requestId?: string
  userId?: string
  reportPlatform?: string
  apiQuery?: string
  isClearLog?: boolean
}

export interface ResConfig {
  data: any
  url: string
}

export interface InitConfig {
  uniqueId?: string
  platform?: string
  customFields: any
  isShowLog?: boolean
  isOnLifecycle?: boolean
  isOnCaptureScreen?: boolean
  isOnTapEvent?: boolean
  isTraceRoute?: boolean
  isTraceNetwork?: boolean
  isTraceMemory?: boolean
}

export interface PageOpts {
  route: string
  options: any,
  __displayReporter: any
}
