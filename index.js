
var express = require('express')
var app = express()

var fs = require('fs')
var path = require('path')
var _ = require('lodash')
var engines = require('consolidate')
var cors = require('cors')
var bodyParser = require('body-parser')

const Todo = require('./dbtest').Todo;

app.use(cors());

// app.engine('hbs', engines.handlebars)
//
// app.set('views', './views')
// app.set('view engine', 'hbs')

app.get('/:dir', function (req, res) {
  try {
    Todo.find({} , (error , todos) => {
      res.json(todos);
    });
  }
  catch (e) {
    res.sendStatus(404);
  }
})

app.get('/:dir/:id', function (req, res) {
  var id = req.params.id;

  try {
    Todo.findOne({id: id} , (error , todos) => {
      res.json(todos);
    });
  }
  catch (e) {
    res.sendStatus(404);
  }
})

app.put('/:dir/:id', bodyParser.json() , function (req, res) {
  var id = req.params.id;
  var dir = req.params.dir;

  try {
      Todo.find({id: id} , (error , todos) => {
        console.log(todos);
      let todo = todos[0];

      Object.assign(todo , req.body);

      Todo.findOneAndUpdate({id: id} , todo , () => {});

      res.json(todo);
    });
  }
  catch (e) {
    console.log("hello error");
    res.sendStatus(404);
  }
})

app.post('/:dir/', bodyParser.json() , function (req, res) {

  var dir = req.params.dir;

  Todo.find({} , (error , todos) => {
    let id = todos.reduce((max , curr) => {
      max = curr.id > max ? curr.id : max;
      return max;
    } , todos[0].id);

    let todo = {
              "userId": 0,
              "id": id,
              "title": "",
              "completed": false
           };
    Object.assign(todo , req.body);
    todo.id = id + 1;
    // console.log(todo);
    Todo.create(todo , (error , new_todo) => {
      console.log(new_todo);
      res.json(new_todo);
    })
  })
})

var server = app.listen(3000, function () {
  console.log('Server running at http://localhost:' + server.address().port)
});
