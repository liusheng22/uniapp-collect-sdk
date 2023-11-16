<template>
  <view class="center">
    <view class="button-default" @tap="link">
      <text v-if="title">{{ title }}</text>
      <slot v-else />
      <text>　to => {{ url }}</text>
    </view>
  </view>
</template>

<script>
  export default {
    props: {
      title: {
        type: String,
        default: ''
      },
      url: {
        type: String,
        default: ''
      }
    },
    methods: {
      link() {
        const dt = Date.now()
        uni.navigateTo({
          url: `${this.url}?dt=${dt}`,
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
