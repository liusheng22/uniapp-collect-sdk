<template>
  <view>
    <navigate-to url="/pages/test/a"></navigate-to>
    <navigate-to url="/pages/test/b"></navigate-to>
    <navigate-to url="/pages/test/c"></navigate-to>
    <navigate-to url="/pages/test/a-nvue"></navigate-to>
    <navigate-to url="/pages/test/b-nvue"></navigate-to>
    <navigate-to url="/pages/test/c-nvue"></navigate-to>

    <custom-button data-logs="自定义事件类型" data-type="custom-type" @tap.stop>自定义埋点的上报类型</custom-button>
    <custom-button @tap.stop="customReport">通过js进行手动上报</custom-button>
    <custom-button data-logs="有tap的data-logs" @tap.stop>有tap的自定义点击</custom-button>
    <custom-button>无tap的自定义点击</custom-button>
    <a href="http://baidu.com">a标签点击</a>
    <navigator url="http://baidu.com">navigator点击</navigator>

    <view class="center">
      <input type="text" placeholder="请输入" />
      <img data-logs="猫-img" :src="img" mode="widthFix" @tap.stop />
    </view>
    <image data-logs="猫-image" :src="img" mode="widthFix" @tap.prevent />
  </view>
</template>

<script>
export default {
  data() {
    return {
      img: 'https://img.yzcdn.cn/vant/cat.jpeg',
    }
  },
  onShareAppMessage() {
    return {
      title: 'a 页面',
    }
  },
  methods: {
    customReport() {
      collectLogs.customReport({
        project: 'custom_project',
        eventType: 'custom-click'
      },{
        key1: 'value1',
        key2: 'value2',
      })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
