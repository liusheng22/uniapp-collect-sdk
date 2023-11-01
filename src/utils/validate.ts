import { isObject } from './data-type'

/**
* @description 验证参数
* @param {*} props object
* @returns [boolean, string]
*/
export const validateParams = (props: any): [boolean, string] => {
  const { customFields } = props

  // customFields 必须是对象
  if (!isObject(customFields)) {
    return [false, 'customFields 必须是对象']
  }

  return [true, '']
}
