
var uri = 'mongodb://localhost:27017/test';

var _ = require('lodash');
var mongoose = require('mongoose');
mongoose.connect(uri);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log('db connected');
});

var todoSchema = mongoose.Schema({
  userId: Number,
  id: Number,
  title: String,
  completed: Boolean
});

exports.Todo = mongoose.model('Todo', todoSchema);
