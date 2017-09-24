/**
 * 配置server端，和发布环境无关的一些信息
 */
module.exports = {
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
