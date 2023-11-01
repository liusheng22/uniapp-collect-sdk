const isObject = (obj: any) => {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

const isArray = (arr: any) => {
  return Object.prototype.toString.call(arr) === '[object Array]'
}

const isFunction = (fn: any) => {
  return Object.prototype.toString.call(fn) === '[object Function]'
}

/**
 * @description 根据传入的参数，返回对应的类型
 * @param {*} obj
 * @returns {string} boolean | null | undefined | number | string | object | array | function
 */
const type = (obj: any) => {
  const toString = Object.prototype.toString
  const map = {
    '[object Boolean]': 'boolean',
    '[object Null]': 'null',
    '[object Undefined]': 'undefined',
    '[object Number]': 'number',
    '[object String]': 'string',
    '[object Object]': 'object',
    '[object Array]': 'array',
    '[object Function]': 'function'
  }
  return map[toString.call(obj)]
}

export {
  isObject,
  isArray,
  isFunction,
  type
}
