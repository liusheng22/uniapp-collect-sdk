export default {
  onLoad() {
    // eslint-disable-next-line no-undef
    uni.showModal({
      title: 'onLoad',
      content: 'mixins js',
      showCancel: true
    })
  },
  onShow() {
    // eslint-disable-next-line no-undef
    uni.showModal({
      title: 'onShow',
      content: 'mixins js',
      showCancel: true
    })
  }
}
