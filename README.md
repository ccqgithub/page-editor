# page-editor

> 简单的页面管理

## 依赖

- `node@lts`, nodejs 环境
- `mongodb@3`, mogodb 服务

## 配置

> 新增一个发布环境时， 修改下面这三个文件。

- `config/pm2.config.js`: pm2启动服务器配置
- `config/env.conf.js`: 配置不同发布环境的相关参数
- `package.json > scripts`: 配置便捷发布

## 启动

```sh
# 进入目录
cd page-editor

# 安装依赖
npm install

# 启动本地开发
npm run dev

# 或者发布生产
npm run release-prod
```

## 添加用户名密码

> 见 `script/adduser.js`
