const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PageSchema = new Schema({
  name: String,
  description: String,
  content: String,
});

module.exports = PageSchema;
