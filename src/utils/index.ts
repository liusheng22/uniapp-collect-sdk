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
  let temp: any
  if (mm < 10) temp.mm = '0' + mm
  if (d < 10) temp.d = '0' + d
  if (h < 10) temp.h = '0' + h
  if (m < 10) temp.m = '0' + m
  if (s < 10) temp.s = '0' + s
  return `${y}-${temp.mm}-${temp.d} ${temp.h}:${temp.m}:${temp.s}`
}
