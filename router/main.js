"use strict"

/**
 * 主路由
 */

var os = require('os');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var router = require('koa-router')();
var debug = require('debug')('app:router-main');
var authLogin = require('../middleware/auth-login');
var UserSchema = require('../db/schema/user')

// 首页
router.get('/', authLogin(), function * (next) {
  yield this.render('index', this.state.locals);
});

// login
router.get('/login', function * (next) {
  yield this.render('login', this.state.locals);
});

// login
router.post('/api/login', function * (next) {
  var data = this.request.body;
  var sha1 = crypto.createHash('sha1');
  var password;
  var connection = this.state.getDB();
  var UserModel = connection.model('User', UserSchema, 'user');
  var find = yield UserModel.findOne({
    $and: [
      { username: { $eq: data.username } },
    ]
  }).exec();

  sha1.update(data.password + this.state.passwordKey);
  password = sha1.digest('hex');

  if (!find) {
    this.throw('user is not exist!');
  }

  if (find.username !== password) {
    this.throw('password is not correct!');
  }

  delete find.password;

  this.session.user = find;
  this.state.result = this.find;
});

// siteList
router.get('/api/sites', authLogin(), function * (next) {
  this.state.result = yield LocaleService.siteList(this);
});

// localeList
router.get('/api/locales', authLogin(), function * (next) {
  var site = this.request.query.site;
  this.state.result = yield LocaleService.siteLocaleList(this, site);
});

// contexts
router.get('/api/contexts', authLogin(), function * (next) {
  var site = this.request.query.site;
  var locale = this.request.query.locale;
  this.state.result = yield LocaleService.siteLocaleContextList(this, site, locale);
});

// translates
router.get('/api/translates', authLogin(), function * (next) {
  this.state.result = yield LocaleService.siteLocaleTranslateList(this, this.request.query);
});

// import json
router.post('/api/importJson', authLogin(), function * (next) {
  var site = this.request.body.site;
  var locale = this.request.body.locale;
  var data = this.request.body.data;

  this.state.result = yield LocaleService.importJson(this, site, locale, JSON.parse(data));
});

// edit item
router.post('/api/editItem', authLogin(), function * (next) {
  var _id = this.request.body._id;
  var value = this.request.body.value;

  this.state.result = yield LocaleService.editItem(this, {
    _id: _id,
    value: value,
  });
});

// delete item
router.post('/api/deleteItem', authLogin(), function * (next) {
  var _id = this.request.body._id;
  this.state.result = yield LocaleService.deleteItem(this, _id);
});

// add item
router.post('/api/addItem', authLogin(), function * (next) {
  var data = this.request.body;
  this.state.result = yield LocaleService.addNewItem(this, data);
});

// add locale
router.post('/api/addLocale', authLogin(), function * (next) {
  var data = this.request.body;
  this.state.result = yield LocaleService.addLocale(this, data);
});

// 导出
router.get('/api/exportJson', authLogin(), function * (next) {
  var site = this.request.query.site;
  var locale = this.request.query.locale;
  var result = yield LocaleService.getJson(this, site, locale);

  this.set('Content-disposition', `${site}-${locale}-locale.json`);
  this.set('Content-type', 'application/json;charset=utf-8');
  this.body = JSON.stringify(result, null, 2);
});

module.exports = router;
