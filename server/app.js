"use strict";

/**
 * 项目主文件
 */

const fs = require('fs');
const path = require('path');
const env = process.env.NODE_ENV || 'development';
const appEnv = process.env.APP_ENV || 'local';
const config = require('../config/server/env.conf');

// env
process.env.DEBUG = config.debug;

const url = require('url');
const Koa = require('koa');
const cors = require('koa-cors');
const morgan = require('koa-morgan');
const session = require('koa-session');
const staticServe = require('koa-static');
const views = require('koa-views');
const bodyParser = require('koa-body');
const conditional = require('koa-conditional-get');
const compress = require('koa-compress')
const etag = require('koa-etag');
const rewrite = require('koa-rewrite');
const debug = require('debug')('app:boot');
const mongoose = require('mongoose');
const NODE_ENV = process.env.NODE_ENV;

// new app
const app = new Koa();

if (NODE_ENV !== 'production') {
  const webpack = require('webpack');
  const hotMiddleware = require('koa-webpack-hot');
  const webpackConfig = require('../build/fe/webpack.conf');
  const compiler = webpack(webpackConfig);
  // run webpack
  const watching = compiler.watch({
    // aggregateTimeout: 300,
    // poll: undefined
  }, (err, stats) => {
    if (err) {
      console.error(err.stack || err);
      if (err.details) {
        console.error(err.details);
      }
      return;
    }

    const info = stats.toJson();

    if (stats.hasErrors()) {
      console.error(info.errors);
    }

    if (stats.hasWarnings()) {
      console.warn(info.warnings)
    }
  });

  app.use(hotMiddleware(compiler, {
    // log: console.log,
    // path: '/__webpack_hmr',
    // heartbeat: 10 * 1000
  }));
}

// app vars
app.env = env;
app.appEnv = appEnv;
app.name = 'page-editor';
app.proxy = true; //如果为 true，则解析 "Host" 的 header 域，并支持 X-Forwarded-Host
app.subdomainOffset = 2; //默认为2，表示 .subdomains 所忽略的字符偏移量。
app.root = __dirname;
app.db = null;
app.keys = ["You're right, i am page-editor !"];

// err events
app.on('error', (err) => {
  console.log(err);
});

// compress
app.use(compress({
  threshold: 2048,
  flush: require('zlib').Z_SYNC_FLUSH
}));
// use it upstream from etag so
// that they are present
app.use(conditional());
// add etags
app.use(etag());

// 跨域配置
app.use(cors({
  origin(request) {
    return '*';
  }
}));

// 静态文件
app.use(staticServe(path.join(__dirname, '../public'), {
  maxage: 1000,
}));

// 开启访问日志
// app.use(logger());
app.use(morgan('combined', {
  skip(req, res) {
    // return res.statusCode == 200;
  }
}));

// 开启session
app.use(session(app));

// 总入口
app.use(async (ctx, next) => {
  let status, message;

  ctx.compress = true;
  ctx.state.config = config;
  ctx.state.getDB = () => {
    if (!app.db) {
      app.db = mongoose.connect(config.mongoServer);
    }
    return app.db;
  }

  // is ajax xhr
  ctx.state.isAjax = ctx.request.headers['x-requested-with'] && ctx
    .request
    .headers['x-requested-with']
    .toLowerCase() == 'xmlhttprequest';

  // locals
  ctx.state.baseUrl = '/';

  try {
    await next();

    if (ctx.state.isAjax) {
      ctx.body = {
        status: 200,
        result: ctx.state.result,
        message: ctx.state.message || 'ok'
      };
    }
  } catch (e) {
    e.message && console.log(e.message);
    console.log(e.stack || e);

    if (typeof e == 'object' && typeof e.message != 'undefined') {
      status = e.status || 500;
      message = e.message;
    } else {
      status = status || 500;
      message = e;
    }

    if (!ctx.state.isAjax) {
      ctx.status = 500;
      ctx.body = message;
    } else {
      ctx.body = {
        code: status || 500,
        expose: ctx.state.expose,
        message: message
      };
    }
  }
});

// body
app.use(bodyParser({
  multipart: true,
  formLimit: 10 * 1024 * 1024,
}));

// views
app.use(views(path.join(__dirname, '../public/_view/'), {
  extension: 'html',
  map: {
    html: 'ejs'
  }
}));

// router
app.use(require('./router/main').routes());

// 404
app.use(async (ctx, next) => {
  ctx.throw('Not Found', 404);
});

// 开启监听服务
const server = app.listen(config.port);
