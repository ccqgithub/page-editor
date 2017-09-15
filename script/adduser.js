var crypto = require('crypto');
var mongoose = require('mongoose');
var config = require('../config/env.conf');
var db = mongoose.connect(config.mongoServer);
var co = require('co');
var sha1, password;

var user = {
  username: 'test',
  password: '123456',
  role: 'editor', // admin, editor, other
}

sha1 = crypto.createHash('sha1');
sha1.update(user.password + config.passwordKey);
password = sha1.digest('hex');
user.password = password;

co(function * () {
  var UserSchema = require('../db/schema/user');
  var UserModel = db.model('User', UserSchema, 'user');
  var result = yield UserModel.create(user);

  console.log(result);
});
