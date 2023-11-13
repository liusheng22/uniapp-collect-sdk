<template>
  <view class="center">
    mixin-component
  </view>
</template>

<script>
import { collectLogs } from '../../pages/test/logs'
const collectLogsMixin = collectLogs.getMixin() || {}

export default {
  mixins: [collectLogsMixin],
}
</script>

<style lang="scss" scoped>

</style>
