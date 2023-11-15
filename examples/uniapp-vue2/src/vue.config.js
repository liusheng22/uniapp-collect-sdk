// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')
module.exports = {
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.vue$/,
          use: {
            // loader: 'vue-inset-loader'
            loader: path.resolve(__dirname, '../node_modules/wxb-uniapp-inset-loader/src/index.js'),
            options: {
              VUE_APP_PLATFORMS: ['app-plus'],
              wxbCollectLogs: true
            }
          }
        }
      ]
    }
  }
}
