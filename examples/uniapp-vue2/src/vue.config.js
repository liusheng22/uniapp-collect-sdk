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
            loader: path.resolve(__dirname, '../node_modules/vue-inset-loader')
          }
        }
      ]
    }
  }
}
