var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PageSchema = new Schema({
  name: String,
  description: String,
  content: String,
});

module.exports = PageSchema;
