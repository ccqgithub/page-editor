const crypto = require('crypto');
const mongoose = require('mongoose');
const config = require('../config/server/env.conf');
const db = mongoose.connect(config.mongoServer);
const co = require('co');
const sha1, password;

const user = {
  username: 'test',
  password: '123456',
  role: 'editor', // admin, editor, other
}

sha1 = crypto.createHash('sha1');
sha1.update(user.password + config.passwordKey);
password = sha1.digest('hex');
user.password = password;

(async () => {
  let UserSchema = require('../server/db/schema/user');
  let UserModel = db.model('User', UserSchema, 'user');
  let result = await UserModel.create(user);

  console.log(result);
})();
