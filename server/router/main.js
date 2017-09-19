"use strict"

/**
 * 主路由
 */

const os = require('os');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const router = require('koa-router')();
const debug = require('debug')('app:router-main');
const authLogin = require('../middleware/auth-login');
const UserSchema = require('../db/schema/user');
const PageSchema = require('../db/schema/page');

// 首页
router.get('/', authLogin(),async (ctx, next) => {
  await ctx.render('index');
});

// 页面详情
router.get('/pages/:pageId', authLogin(),async (ctx, next) => {
  let pageId = ctx.params.pageId;
  let connection = ctx.state.getDB();
  let PageModel = connection.model('Page', PageSchema, 'page');
  let find = await PageModel.findOne({
    _id: pageId
  }).exec();

  ctx.state.pageInfo = find;

  await ctx.render('page-info');
});

// login
router.get('/login', async (ctx, next) => {
  await ctx.render('login');
});

router.get('/logout', async (ctx, next) => {
  ctx.session.user = null;
  ctx.redirect('/login');
});

// login
router.post('/api/login', async (ctx, next) => {
  let data = ctx.request.body;
  let sha1 = crypto.createHash('sha1');
  let password;
  let connection = ctx.state.getDB();
  let UserModel = connection.model('User', UserSchema, 'user');
  let find = await UserModel.findOne({
    $and: [
      { username: { $eq: data.username } },
    ]
  }).exec();

  sha1.update(data.password + ctx.state.config.passwordKey);
  password = sha1.digest('hex');

  if (!find) {
    ctx.throw('user is not exist!');
  }

  if (find.password !== password) {
    ctx.throw('password is not correct!');
  }

  delete find.password;

  ctx.session.user = find;
  ctx.state.result = find;
});

// page list
router.get('/api/pages', authLogin(), async (ctx, next) => {
  let params = ctx.request.query;
  let connection = ctx.state.getDB();
  let PageModel = connection.model('Page', PageSchema, 'page');
  let search = [];
  let findObj = {};

  if (params.keyword) {
    search.push({
      $where: `this.name.indexOf('${params.keyword}') != -1 || this.description.indexOf('${params.keyword}') != -1`
    });
  }

  if (search.length) {
    findObj['$and'] = search;
  }

  let pages = await PageModel.find(findObj).sort({_id: -1}).exec();

  ctx.state.result = pages;
});


// edit item
router.post('/api/editPage', authLogin(), async (ctx, next) => {
  let id = ctx.request.body._id;
  let name = ctx.request.body.name;
  let description = ctx.request.body.description;
  let connection = ctx.state.getDB();
  let PageModel = connection.model('Page', PageSchema, 'page');

  let updateResult = await PageModel.update({
    _id: id
  }, {
    name: name,
    description: description,
  }).exec();

  ctx.state.result = updateResult;
});

router.post('/api/editPageContent', authLogin(), async (ctx, next) => {
  let id = ctx.request.body._id;
  let content = ctx.request.body.content;
  let connection = ctx.state.getDB();
  let PageModel = connection.model('Page', PageSchema, 'page');

  let updateResult = await PageModel.update({
    _id: id
  }, {
    content: content,
  }).exec();

  ctx.state.result = updateResult;
});

// delete item
router.post('/api/deletePage', authLogin(), async (ctx, next) => {
  let id = ctx.request.body._id;
  let connection = ctx.state.getDB();
  let PageModel = connection.model('Page', PageSchema, 'page');

  let updateResult = await PageModel.deleteOne({
    _id: id
  }).exec();

  ctx.state.result = id;
});

// add item
router.post('/api/addPage', authLogin(), async (ctx, next) => {
  let data = ctx.request.body;
  let connection = ctx.state.getDB();
  let PageModel = connection.model('Page', PageSchema, 'page');
  let find = await PageModel.findOne({
    $and: [
      { name: { $eq: data.name } },
    ]
  }).exec();

  if (find) {
    throw new Error('内容已存在！');
  };

  let result = await PageModel.create({
    name: data.name,
    description: data.description,
    content: data.content || ''
  });

  ctx.state.result = result;
});

// oos上传文件数据
router.get('/api/upload/meta', authLogin(), async (ctx, next) => {
  let ossConfig = require('../../config/server/non-env.conf').ossConfig;
  let ISODateString = function(d) {
    function pad(n){
      return n < 10 ? '0' + n : n
    }
    return d.getUTCFullYear()+'-'
      + pad(d.getUTCMonth()+1)+'-'
      + pad(d.getUTCDate())+'T'
      + pad(d.getUTCHours())+':'
      + pad(d.getUTCMinutes())+':'
      + pad(d.getUTCSeconds())+'Z';
  };

  let expiration = ISODateString(new Date(new Date().getTime() + 180000));
  let policy = {
    "expiration": expiration,
    "conditions": [
      { "bucket": ossConfig.bucket },
      [ "content-length-range", 0, 500 * 1024 * 1024]
    ]
  };

  let policyStr = new Buffer(JSON.stringify(policy)).toString('base64');
  let signature = crypto
    .createHmac('sha1', ossConfig.accessKeySecret)
    .update(policyStr)
    .digest()
    .toString('base64');

  ctx.state.result = {
    OSSAccessKeyId: ossConfig.accessKeyId,
    policy: policyStr,
    signature: signature,
    success_action_status: 201,
    bucket: ossConfig.bucket,
    bucketUrl: ossConfig.bucketUrl,
  }
});

module.exports = router;
