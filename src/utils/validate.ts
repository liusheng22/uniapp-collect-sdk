import { isObject, isString } from './data-type'
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
const validateKeyword = (props: object): [boolean, string] => {
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
