<template>
  <div>
    <div class="center">a page</div>
    <button @tap="link('/pages/test/b')">to b page</button>
    <view class="button-default" @tap="link('/pages/test/c')">to c page</view>

    <button  data-logs="errorInfo" data-type="errorType" @tap="noop" style="margin:30rpx 0;">点击测试</button>
    <div data-logs="errorInfo" data-type="errorType" @tap="noop" style="margin:30rpx 0;">点击测试</div>
    <div class="test" @tap="noop" style="margin:30rpx 0;">点击测试</div>
  </div>
</template>

<script>
export default {
  components: {},
  mixins: [],
  // 数据状态
  data() {
    return {}
  },
  // onLoad(options) {
  //   // console.log('aaaa', this.appid)
  // },
  // onShow() {
  //   console.log('页面的 show')
  // },
  // onHide() {
  //   console.log('页面的 hide')
  // },
  // 分享
  onShareAppMessage() {
    return {
      title: 'a 页面',
    }
  },
  // 方法
  methods: {
    link(url) {
      uni.navigateTo({
        url
      })
    },
    noop() {
      // console.log('noop')
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
