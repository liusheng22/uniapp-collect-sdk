<template>
  <view class="center">
    <!-- <view
      :randomNum="randomNum"
      :change:randomNum="collectLogs.randomNumChange"
    ></view> -->
    test111112222
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
export default {
  mounted() {
    // 监听全局点击事件
    document.addEventListener('click', this.clickHandler)
  },
  methods: {
    isBoolean(bool) {
      return Object.prototype.toString.call(bool) === '[object Boolean]'
    },
    clickHandler(e) {
      console.log("🚀 ~ file: test-component.vue:35 ~ clickHandler ~ e:", e)
      const { target, touches, pageX, pageY } = e
      const tapsInfo = {}
      let elInnerText = ''
      var dataset = {}

      const { tagName } = target
      if (['UNI-BUTTON', 'UNI-NAVIGATOR', 'BUTTON', 'A'].includes(tagName)) {
        elInnerText = this.getElInnerText(target)
      }

      if (['IMG'].includes(tagName)) {
        var { dataset } = target.parentElement
      } else {
        var { dataset } = target
      }

      const { logs, type } = dataset
      tapsInfo.tapType = this.isBoolean(type) ? '' : type
      tapsInfo.tapText = this.isBoolean(logs) ? '' : logs
      tapsInfo.tapText = tapsInfo.tapText || elInnerText
      // console.log('logs, type ->', logs, type)

      tapsInfo.tapText && this.$ownerInstance.callMethod('reportClick', {
        eventType: tapsInfo.tapType || 'button_click',
        extendFields: {
          button_title: tapsInfo.tapText,
          abscissa: pageX,
          ordinate: pageY,
        }
      })
    },
    getElInnerText(el) {
      return el.innerText || el.textContent || el.nodeValue || el.value || ''
    },
  }
}
</script>

<style lang="scss" scoped>

</style>
