<template>
  <div class="shade" v-if="demo1Show">
    <!-- 弹窗 -->
    <div class="modal">
      <div class="modal-title">
        <span>标题demo1</span>
        <span class="close" @click="close1">X</span>
      </div>
      <div class="modal-content" @tap="getDemo1">
        <p>内容</p>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      test1: {
        type: Boolean,
        default: false
      },
      testFn1: {
        type: Function,
        default: () => {}
      },
      testArr1: {
        type: Array,
        default: () => []
      },
      testObj1: {
        type: Object,
        default: () => {}
      }
    },
    data() {
      return {
        demo1Show: true,
        demo1: 'demo1'
      }
    },
    created() {
      console.log('demo1 created')
    },
    mounted() {
      console.log('demo1 mounted')
    },
    methods: {
      getDemo1() {
        console.log(this.demo1)
        return this.demo1
      },
      close1() {
        this.$emit('close')
        this.demo1Show = false
        console.log('close demo1 x', this.getDemo1())
      }
    }
  }
</script>

<style lang="scss" scoped>
.shade {
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  position: relative;

  .modal {
    width: 80%;
    height: 200px;
    background-color: #fff;
    border-radius: 10px;
    position: fixed;
    top: 20%;
    left: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 10px #ccc;

    .modal-title {
      height: 40px;
      line-height: 40px;
      padding: 0 10px;
      border-bottom: 1px solid #ccc;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .close {
        cursor: pointer;
      }
    }

    .modal-content {
      padding: 10px;
      height: 160px;
      overflow: auto;
    }
  }
}
</style>
