/**
 * 配置页面入口，和打包
 */

// 这个例子为了展示 统一站点分模块打包的情况(比如前台和后台在统一项目时)，
// 实际使用可能不会这么复杂

const vueEntry = {
  'page/login': './src/entry/login.js',
  'page/index': './src/entry/index.js',
  'page/page-info': './src/entry/page-info.js'
}

const vueCommonChunks = ['com-vue', 'vendor-vue', 'vendor-vue-core'];

module.exports = {
  // common打包
  commons: [
    // vue
    {
      name: 'com-vue',
      minChunks: function (module, count) {
        let re = /src\/lib|node_modules/;
        return module.context && re.test(module.context);
      },
      chunks: Object.keys(vueEntry)
    },
    {
      name: 'vendor-vue',
      minChunks: function (module, count) {
        let re = /node_modules/;
        // css 不需要 spliting
        let exclueRe = /^.*\.(css|sass|scss|less|styl)$/;
        return module.context
          && re.test(module.context)
          && !exclueRe.test(module.resource);
      },
      chunks: ['com-vue']
    },
    {
      name: 'vendor-vue-core',
      minChunks: function (module, count) {
        let re = /node_modules\/.*?(vue|vue-router|vuex)/;
        return module.context && re.test(module.context);
      },
      chunks: ['vendor-vue']
    },
    // manifest
    {
      name: "manifest",
      minChunks: Infinity,
      chunks: ['vendor-rc-core', 'vendor-vue-core'],
    }
  ],
  // 页面设置
  pages: [
    {
      name: 'page/login',
      js: vueEntry['page/login'],
      template: './src/view/login.html',
      filename: '_view/login.html',
      commonChunks: vueCommonChunks,
    },
    {
      name: 'page/index',
      js: vueEntry['page/index'],
      template: './src/view/index.html',
      filename: '_view/index.html',
      commonChunks: vueCommonChunks,
    },
    {
      name: 'page/page-info',
      js: vueEntry['page/page-info'],
      template: './src/view/page-info.html',
      filename: '_view/page-info.html',
      commonChunks: vueCommonChunks,
    },
  ]
}
