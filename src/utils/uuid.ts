import { wxb } from '@/constants/index'

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

export const setUuid = () => {
  const id = uuid()
  wxb.setStorageSync('uuid', id)
  return id
}

export const getUuid = () => {
  const id = wxb.getStorageSync('uuid')
  wxb.removeStorageSync('uuid')
  return id || setUuid()
}
