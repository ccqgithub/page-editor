/**
 * 配置server端，和发布环境无关的一些信息
 */
module.exports = {
  // i18n-service 配置
  i18nServiceConfig: {
    server: 'http://8.8.8.8:50011/',
    site: 'test',
    locales: ['zh-cn', 'en']
  },

  // aliyun oss config
  ossConfig: {
    endpoint: 'https://oss-cn-shanghai.aliyuncs.com',
    accessKeyId: 'accessKeyId',
    accessKeySecret: 'accessKeySecret',
    bucket: 'bucket',
    bucketUrl: 'https://bucket.oss-cn-shanghai.aliyuncs.com',
    secure: true,
  }
}
