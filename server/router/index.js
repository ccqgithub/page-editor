"use strict"

/**
 * 主路由
 */

var os = require('os');
var fs = require('fs');
var path = require('path');
var router = require('koa-router')();

// 首页
router.get('/', function * (next) {
  this.state.pageData = {

  };
  yield this.render('index', this.state.locals);
});

module.exports = router;
