import { wxb } from '@/constants'

// 判断某个uni的API是否可用
export const canIUse = (apiName: string) => {
  return wxb.canIUse(apiName)
}
