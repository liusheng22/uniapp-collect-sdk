import { CollectLogs } from './index'

export function onPageShow(logs: CollectLogs) {
  console.log('-----onShow------')
  // logs.currentPages = activityPage().route
  // this.currentsRoutes = [ ...routeList ]
  // if (this.timer) {
  //   this.compareRouterList() && this.$logs.reportLog({
  //     errorType: 'stayTime',
  //     errorInfo: {
  //       seconds: this.seconds,
  //       pagePath: this.compareRouterList()
  //     }
  //   })
  //   this.clearInterval(this.timer)
  //   uni.setStorageSync('previousRoutes', routeList)
  //   // this.previousRoutes = [ ...routeList ]
  // } else {
  //   this.startInterval()
  //   this.previousPages = routeList[0]
  //   uni.setStorageSync('previousRoutes', routeList)
  //   // this.previousRoutes = [ ...routeList ]
  // }
}

// export function onPageHide (logs: CollectLogs, oldOnHide: any) {
export function onPageHide(
  logs: CollectLogs,
  methods: any,
  methodName: any,
  ...arg: any[]
) {
  const oldOnHide = methods[methodName]
  console.log('------onHide-------0', logs)
  methods[methodName] = function () {
    console.log('------onHide-------1')
    oldOnHide.apply(this, arg)
  }
}
