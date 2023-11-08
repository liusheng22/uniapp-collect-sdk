<template>
  <view class="center">
    <!-- <view
      :randomNum="randomNum"
      :change:randomNum="collectLogs.randomNumChange"
    ></view> -->
    test11111
  </view>
</template>

<script>
  export default {
    mounted() {
      console.log('test components 页面的 monted')
    },
    methods: {
      reportClick(params) {
        this.$collectLogs.reportLog(params)
      }
    }
  }
</script>

<script module="collectLogs" lang="renderjs">
const isBoolean = (bool) => {
  return Object.prototype.toString.call(bool) === '[object Boolean]'
}

export default {
  mounted() {
    // 监听全局点击事件
    document.addEventListener('click', this.clickHandler)
  },
  methods: {
    clickHandler(e) {
      const { target, touches, pageX, pageY } = e
      const tapsInfo = {}
      var dataset = {}

      if (['IMG'].includes(target.tagName)) {
        var { dataset } = target.parentElement
      } else {
        var { dataset } = target
      }


      const { logs, type } = dataset
      tapsInfo.tapType = isBoolean(type) ? '' : type
      tapsInfo.tapText = isBoolean(logs) ? '' : logs
      // console.log('logs, type ->', logs, type)

      tapsInfo.tapText && this.$ownerInstance.callMethod('reportClick', {
        eventType: tapsInfo.tapType || 'button_click',
        extendFields: {
          button_title: tapsInfo.tapText,
          abscissa: pageX,
          ordinate: pageY,
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
