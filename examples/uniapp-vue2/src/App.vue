<script>
export default {
  globalData: {
  },
  onLaunch: function() {
    // console.log('----- App Launch -----')
    // console.log('---launch aa ->', getApp().globalData.aa)
    // console.log('---launch aa ->', this.globalData.aa)
    // console.log('---this.$scope---')
    // console.log(this.$scope.globalData)
  },
  onShow: function() {
    // console.log('----- App Show -----')
  },
  onHide: function() {
    // console.log('----- App Hide -----')
  }
}
</script>

<style>
.body {
  display: flex;
  flex-direction: column;
  width: 750rpx;
  flex: 1;
}

.button-default {
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  color: #000;
  display: inline-block;
  font-size: 14px;
  height: 40px;
  line-height: 40px;
  /* margin: 0 10px; */
  width: 90%;
  padding: 0 15px;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  touch-action: manipulation;
  cursor: pointer;
  -webkit-user-select: none;
  user-select: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  margin: 20rpx 0;
}

.center {
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20rpx 0;
}
</style>
