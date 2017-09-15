/**
 * 配置server端，不同发布环境的一些信息
 */

var APP_ENV = process.env.APP_ENV || 'local'
var configs = {}

var common = {
  env: APP_ENV,
  debug: 'app:*',
  port: 50011,

  // mongo
  mongoServer: 'mongodb://page-editor:page-editor-user@127.0.0.1:27017/page-editor',

  // password key
  passwordKey: 'oooxxx',
}

// local
configs['local'] = Object.assign({}, common, {
  port: 50011,
})

// test
configs['test'] = Object.assign({}, common, {
  port: 50011,
})

// prod
configs['prod'] = Object.assign({}, common, {
  port: 50011,
})

module.exports = configs[APP_ENV]
