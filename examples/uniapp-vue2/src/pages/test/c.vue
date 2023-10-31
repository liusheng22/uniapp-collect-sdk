<template>
  <div>
    <div class="center">c page</div>
    <button @tap="link('/pages/test/a')">to a page</button>
    <view class="button-default" @tap="link('/pages/test/b')">to b page</view>
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
  onLoad(options) {
    console.log('aaaa', this.appid)
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

<style lang="scss" scoped>
</style>