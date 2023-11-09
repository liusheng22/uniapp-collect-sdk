import { err } from './console-log'
import { isArray, isFunction, isObject } from './data-type'
import { validateKeywords } from './validate'
import { wxb } from '@/constants'
import { PageOpts } from '@/types'

/**
 * 格式化时间
 * @param {Date} time 时间戳
 * @returns YYYY-MM-DD hh:mm:ss
 */
export function formatTime(time: Date = new Date()) {
  const y = time.getFullYear()
  const mm = time.getMonth() + 1
  const d = time.getDate()
  const h = time.getHours()
  const m = time.getMinutes()
  const s = time.getSeconds()
  const temp = {
    mm: `${mm}`,
    d: `${d}`,
    h: `${h}`,
    m: `${m}`,
    s: `${s}`
  }
  if (mm < 10) { temp.mm = `0${ mm}` }
  if (d < 10) { temp.d = `0${ d}` }
  if (h < 10) { temp.h = `0${ h}` }
  if (m < 10) { temp.m = `0${ m}` }
  if (s < 10) { temp.s = `0${ s}` }
  return `${y}-${temp.mm}-${temp.d} ${temp.h}:${temp.m}:${temp.s}`
}

export function activityPage(): PageOpts {
  const pagesList = getCurrentPages()
    .map((item: any) => {
      const obj = item || {}
      return obj
    })
    .reverse()
  const [curr] = pagesList
  return curr || {}
}

export function sleep(time = 1500): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, time))
}

/**
 * 防抖
 * @param {*} func
 * @param {*} wait
 * @param {*} immediate 是否立即执行
 * @returns function
 */
export function debounce(func: any, wait: number, immediate: boolean) {
  let timeout, result

  return function () {
    const self = this
    const args = arguments

    if (timeout) { clearTimeout(timeout) }
    if (immediate) {
      const callNow = !timeout
      timeout = setTimeout(function () {
        timeout = null
      }, wait)
      if (callNow) { result = func.apply(self, args) }
    } else {
      timeout = setTimeout(function () {
        func.apply(self, args)
      }, wait)
    }
    return result
  }
}

/**
 * 节流
 * @param {*} func
 * @param {*} wait
 * @param {*} options  leading：false 表示禁用第一次执行 trailing: false 表示禁用停止触发的回调   leading：false 和 trailing: false 不能同时设置
 * @returns function
 */
export function throttle(func: any, wait: any, options: any) {
  let timeout, self, args
  let previous = 0
  if (!options) { options = {} }

  const later = function () {
    previous = options.leading === false ? 0 : new Date().getTime()
    timeout = null
    func.apply(self, args)
    if (!timeout) { self = args = null }
  }

  const throttled = function () {
    const now = new Date().getTime()
    if (!previous && options.leading === false) { previous = now }
    const remaining = wait - (now - previous)
    self = this
    args = arguments
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      func.apply(self, args)
      if (!timeout) { self = args = null }
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining)
    }
  }
  return throttled
}

// 遍历找出 pages 的对象
export const getPageInfo = (pages: any, pagePath: string) => {
  // const page = pages[pagePath]
  // return page || { navigationBarTitleText: '' }

  const page = pages[pagePath]
  return page || { navigationBarTitleText: '' }
}

export const getAppCurrPageView = () => {
  let titleNView = { titleText: '' }
  // #ifdef APP-PLUS
  const pages = getCurrentPages() || []
  const page = pages[pages.length - 1]
  if (!page) { return titleNView }
  const webView = page.$getAppWebview()
  titleNView = webView.getStyle().titleNView
  // #endif
  return titleNView || { titleText: '' }
}

export const getCustomFields = (customFields: any) => {
  let extendFields = {}
  Object.keys(customFields).forEach((key) => {
    const itemObj = customFields[key]
    if (itemObj['value'] && !isFunction(itemObj['value']) && !isArray(itemObj['value'])) {
      extendFields[key] = itemObj['value']
      return
    }
    const getKey = itemObj['key']
    if (!getKey ) { return }

    const getStoreValue = wxb.getStorageSync(getKey)
    if (isFunction(getStoreValue) && isArray(getStoreValue)) { return }
    if (isObject(getStoreValue)) {
      extendFields = { ...extendFields, ...getStoreValue }
      return
    }
    extendFields[key] = getStoreValue
  })
  return extendFields

}
