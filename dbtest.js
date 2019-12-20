
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

// userSchema.virtual('name.full').get(function () {
//   return _.startCase(this.name.first + ' ' + this.name.last);
// });
//
// userSchema.virtual('name.full').set(function (value) {
//   var bits = value.split(' ');
//   this.name.first = bits[0];
//   this.name.last = bits[1];
// });

exports.Todo = mongoose.model('Todo', todoSchema);

// exports.Todo.find({} , (error , todos) => {
//   console.log(todos);
// });
