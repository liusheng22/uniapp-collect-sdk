import { isArray, isObject, isString } from './data-type'
import { InitConfig } from '../types'
/**
* @description 验证参数
* @param {*} props object
* @returns [boolean, string]
*/
export const validateParams = (props: InitConfig): [boolean, string] => {
  const { customFields, uniqueId, project, serverUrl, sourcePlatform } = props
  const [validate, msg] = validateKeyword({ uniqueId, project, serverUrl, sourcePlatform })

  if (!validate) {
    return [false, msg]
  }

  // customFields 必须是对象
  if (!isObject(customFields)) {
    return [false, '「customFields」必须是对象']
  }

  if (!isString(uniqueId)) {
    return [false, '「uniqueId」必须是字符串']
  }

  if (!isString(project)) {
    return [false, '「project」必须是字符串']
  }

  if (!isString(sourcePlatform)) {
    return [false, '「sourcePlatform」必须是字符串']
  }

  if (!isString(serverUrl)) {
    return [false, '「serverUrl」必须是字符串']
  }

  return [true, '']
}

/**
 * @description 验证关键字
 * @param props
 * @returns boolean
 */
export const validateKeyword = (props: object): [boolean, string] => {
  const unvalidate = []

  if (isObject(props)) {
    for (const i in props) {
      if (!props[i]) {
        unvalidate.push(i)
      }
    }
    if (unvalidate.length) {
      return [false, `缺少必要参数${unvalidate.join()}`]
    }
    return [true, '']
  }
}

export const validateKeywords = (props: object, keywords: Array<string>): [boolean, string] => {
  if (!props && isObject(props)) {
    return [false, '第一个参数应该是一个对象']
  }
  if (!keywords && isArray(keywords)) {
    return [false, '第二个参数应该是一个数组']
  }
  const unvalidate = []
  const propsKeys = Object.keys(props)

  keywords.forEach(item => {
    if (!propsKeys.includes(item)) {
      unvalidate.push(item)
    }
  })
  if (unvalidate.length) {
    return [false, `缺少必要参数${unvalidate.join()}`]
  }
  return [true, '']
}
