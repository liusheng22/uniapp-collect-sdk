const isObject = (obj: any) => {
  return type(obj) === 'object'
}

const isArray = (arr: any) => {
  return type(arr) === 'array'
}

const isFunction = (fn: any) => {
  return type(fn) === 'function'
}

const isBoolean = (bool: any) => {
  return type(bool) === 'boolean'
}

const isNull = (nullObj: any) => {
  return type(nullObj) === 'null'
}

const isUndefined = (undefinedObj: any) => {
  return type(undefinedObj) === 'undefined'
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
  isBoolean,
  isNull,
  isUndefined,
  type
}
