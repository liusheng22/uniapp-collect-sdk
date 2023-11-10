<template>
  <view>
    <div class="center">c page</div>
    <button @tap="link('/pages/test/a')">to a page</button>
    <view class="button-default" @tap="link('/pages/test/b')">to b page</view>
  </view>
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
  //   // console.log('ccc', this.appid)
  // },
  // 分享
  onShareAppMessage() {
    return {
      title: 'c 页面',
    }
  },
  // 方法
  methods: {
    link(url) {
      uni.navigateTo({
        url
      })
    }
  }
}
</script>


<!-- <script module="testLogs" lang="renderjs">
export default {
  mounted() {
    console.log('-----test logs-----')
  }
}
</script> -->

<style lang="scss" scoped>
</style>
