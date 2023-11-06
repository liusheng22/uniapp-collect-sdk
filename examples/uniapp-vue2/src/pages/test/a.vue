<template>
  <div>
    <div class="center">a page</div>
    <button @tap="link('/pages/test/b')">to b page</button>
    <view class="button-default" @tap="link('/pages/test/c')">to c page</view>

    <button  data-logs="errorInfo" data-type="errorType" @tap="noop" style="margin:30rpx 0;">点击测试</button>
    <div data-logs="errorInfo" data-type="errorType" @tap="noop" style="margin:30rpx 0;">点击测试</div>
    <div class="test" @tap="noop" style="margin:30rpx 0;">点击测试</div>
    <div @tap="customClick" style="margin:30rpx 0;">自定义点击测试</div>

    <custom-button data-logs="自定义事件类型" data-type="custom-type" @tap="customClick">自定义埋点点击类型</custom-button>
    <custom-button data-logs="自动采集点击" @tap="customClick">埋点点击</custom-button>
    <custom-button @tap="customClick">自定义点击</custom-button>
  </div>
</template>

<script>
import { collectLogs } from './logs'

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
        url: `${url}?b=2`,
      })
    },
    noop() {
      // console.log('noop')
    },
    customClick() {
      collectLogs.reportLog({
        eventType: 'custom-click'
      })
      // this.$collectLogs.reportLog({
      //   eventType: 'custom-click'
      // })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
