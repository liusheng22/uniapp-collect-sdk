import { CollectLogs } from '..'
import { wxb, uuidStorageKey } from '@/constants/index'

export const uuid = () => {
  const str = 'xxxxxxxx-xxxx-yxyx-xyxy-xxxxxxxxxxxx'.replace(
    /[xy]/g,
    function (c) {
      const r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    }
  )
  return str.replace(/-/g, '')
}

export const setUuid = (logs: CollectLogs) => {
  const id = uuid()
  logs.uuid = id
  wxb.setStorageSync(uuidStorageKey, id)
  return id
}

export const getUuid = (logs: CollectLogs) => {
  const { uuid: id } = logs
  logs.uuid = ''
  wxb.removeStorageSync(uuidStorageKey)
  return id || uuid()
}
