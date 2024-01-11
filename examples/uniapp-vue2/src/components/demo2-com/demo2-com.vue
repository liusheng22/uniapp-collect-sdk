<template>
  <div class="shade2" v-if="demo2Show">
    <!-- 弹窗 -->
    <div class="modal">
      <div class="modal-title">
        <span>标题demo2</span>
        <span class="close" @click="close2">X</span>
      </div>
      <div class="modal-content" @tap="getDemo2">
        <p>内容2 {{ demoComputed }}</p>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      demo2: {
        type: String,
        default: 'demo2'
      }
    },
    created: [
      function() {
        console.log('demo2 created1', this.demo2)
      },
      function() {
        console.log('demo2 created2', this.getDemo2())
      }
    ],
    data() {
      return {
        demo2Show: true
      }
    },
    // created() {
    //   console.log('demo2 created')
    // },
    mounted() {
      console.log('demo2 mounted')
    },
    computed: {
      demoComputed() {
        console.log('computed demo2', this.demo2)
        return this.demo2
      }
    },
    methods: {
      getDemo2() {
        console.log(this.demo2)
        return this.demo2
      },
      close2() {
        this.$emit('close')
        this.demo2Show = false
        console.log('close demo2 x', this.getDemo2())
      }
    }
  }
</script>

<style lang="scss" scoped>
.shade2 {
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
    top: 60%;
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
