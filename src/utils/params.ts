export const formatLibType = (uniPlatform: string, osName: string) => {
  let libType = 'UNIAPP'
  if (uniPlatform === 'app') {
    if (['ios', 'android'].includes(osName)) {
      libType = osName.toUpperCase()
    }
  } else if (['web', 'h5'].includes(uniPlatform)) {
    libType = 'WEB'
  } else if (/^mp-/.test(uniPlatform)) {
    libType = 'MINI_PROGRAM'
  }
  return libType
}
