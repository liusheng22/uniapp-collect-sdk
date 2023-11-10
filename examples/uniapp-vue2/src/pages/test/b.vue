<template>
  <view>
    <div class="center">b page</div>
    <button @tap="link('/pages/test/a')">to a page</button>
    <view class="button-default" @tap="link('/pages/test/c')">to c page</view>
    <!-- <mixin-component /> -->

    <button>btn111</button>
  </view>
</template>

<script>
export default {
  // 数据状态
  data() {
    return {}
  },
  created() {console.log('-----b------')
    console.log('b 页面的 created')
  },
  // onLoad(options) {
  //   // console.log('bbb', this.appid)
  // },
  // 分享
  onShareAppMessage() {
    return {
      title: 'b 页面',
    }
  },
  // 方法
  methods:{
    link(url) {
      uni.navigateTo({
        // url
        url: `${url}?c=3`,
      })
    },
    test() {}
  }
}
</script>

<script module="testLogs" lang="renderjs">
export default {
  mounted  ()    {
    console.log('-----test logs-----')
  },
  methods:    {
    test123() {
      console.log('test123')
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
