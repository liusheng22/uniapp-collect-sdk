/**
 * 深拷贝
 * @param {Object} obj 要拷贝的对象
 * @param {HASH} hash
 * @returns Object
 */
export const deepClone = (obj, hash = new WeakMap()) => {
  // 日期对象直接返回一个新的日期对象
  if (obj instanceof Date) {
    return new Date(obj)
  }
  // 正则对象直接返回一个新的正则对象
  if (obj instanceof RegExp) {
    return new RegExp(obj)
  }
  // 如果循环引用,就用 weakMap 来解决
  if (hash.has(obj)) {
    return hash.get(obj)
  }
  // 获取对象所有自身属性的描述
  const allDesc = Object.getOwnPropertyDescriptors(obj)
  // 遍历传入参数所有键的特性
  const cloneObj = Object.create(Object.getPrototypeOf(obj), allDesc)

  hash.set(obj, cloneObj)
  for (const key of Reflect.ownKeys(obj)) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      cloneObj[key] = deepClone(obj[key], hash)
    } else {
      cloneObj[key] = obj[key]
    }
  }
  return cloneObj
}

/**
 * 浅拷贝
 * @param {Object} obj 要拷贝的对象
 * @returns Object
 */
export const shallowClone = (obj) => {
  const cloneObj = Object.create(Object.getPrototypeOf(obj))
  for (const key of Reflect.ownKeys(obj)) {
    cloneObj[key] = obj[key]
  }
  return cloneObj
}
