<template>
  <view>
    <div class="center">a page</div>
    <button @tap="link('/pages/test/b')">to b page</button>
    <view class="button-default" @tap="link('/pages/test/c')">to c page</view>
    <button @tap="link('/pages/test/a-nvue')">to nvue a page</button>
    <button @tap="link('/pages/test/b-nvue')">to nvue b page</button>

    <!-- <button  data-logs="errorInfo" data-type="errorType" @tap="noop" style="margin:30rpx 0;">点击测试</button>
    <div data-logs="errorInfo" data-type="errorType" @tap="noop" style="margin:30rpx 0;">点击测试</div>
    <div class="test" @tap="noop" style="margin:30rpx 0;">点击测试</div> -->
    <div @tap="customClick" data-logs="dev自动采集点击" style="margin:30rpx 0;">自定义点击测试</div>

    <button data-logs="test-123" @tap="testClick">测试按钮</button>

    <custom-button data-logs="自定义事件类型" data-type="custom-type" @tap="customClick">自定义埋点点击类型</custom-button>
    <custom-button data-logs="自动采集点击" @tap="customClick">埋点点击</custom-button>
    <custom-button data-logs="有tap的data-logs" @tap="customClick">有tap的自定义点击</custom-button>
    <custom-button>无tap的自定义点击</custom-button>
    <a href="http://baidu.com">123</a>
    <navigator url="http://baidu.com">navigator123</navigator>
    <h1>{{ num }}</h1>

    <input type="text" placeholder="请输入" />

    <img data-logs="猫-img" :src="img" mode="widthFix" @tap.stop />

    <image data-logs="猫-image" :src="img" mode="widthFix" @tap.prevent />

    <!-- <test-component /> -->
  </view>
</template>

<script>
import { collectLogs } from './logs'
import CustomButton from '../components/custom-button.vue'

export default {
  components: {
    CustomButton
  },
  mixins: [],
  // 数据状态
  data() {
    return {
      num: 1,
      img: 'https://img.yzcdn.cn/vant/cat.jpeg',
    }
  },
  // onShow() {
  //   console.log('-----tes-t-se-res--adfs--afdsa-f-s---')
  // },
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
    testClick() {
      this.num++
      console.log('testClick')
      this.$collectLogs.customReport({
        eventType: 'test-click'
      })

      // collectLogs.updateCustomFields({
      //   a: 1,
      //   b: 2,
      // })
    },
    customClick() {
      this.num++
      // collectLogs.reportLog({
      //   eventType: 'custom-click'
      // })
      // this.$collectLogs.reportLog({
      //   eventType: 'custom-click'
      // })

      // collectLogs.customReport({
      //   project: 'product_basic1',
      //   eventType: 'custom-click'
      // }, {
      //   c1: 111,
      //   d1: 2222
      // })

      // collectLogs.customReport({
      //   project: 'product_basic1',
      //   eventType: 'custom-click'
      // }, null)

      // collectLogs.customReport({
      //   project: 'product_basic1',
      //   eventType: 'custom-click'
      // }, '测试其他数据类型')

      // collectLogs.customReport(
      //   null,{
      //   c1: 111,
      //   d1: 2222
      // })
    }
  }
}
</script>

<!--
<script module="logs" lang="renderjs">
export default {
  mounted() {
    // 监听全局点击事件
    document.addEventListener('click', this.clickHandler)
  },
  methods: {
    clickHandler(e) {
      const { target } = e
      const { dataset } = target
      const { logs, type } = dataset
      // if (logs) {
      //   console.log('logs', logs)
      //   console.log('type', type)
      // }
    }
  }
}
</script> -->

<style lang="scss" scoped>
</style>
