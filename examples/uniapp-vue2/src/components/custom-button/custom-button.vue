<template>
  <button class="custom-button">
    <slot />
  </button>
</template>

<script>
  export default {
  }
</script>

<style lang="scss" scoped>
.custom-button {
  width: 600rpx;
  margin: 20rpx auto;
}
</style>
