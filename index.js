
var express = require('express')
var app = express()

var fs = require('fs')
var path = require('path')
var _ = require('lodash')
var engines = require('consolidate')
var cors = require('cors')
var bodyParser = require('body-parser')
const jwt = require('jsonwebtoken');

const Todo = require('./dbtest').Todo;
const User = require('./dbtest').User;

app.use(cors());

// app.engine('hbs', engines.handlebars)
//
// app.set('views', './views')
// app.set('view engine', 'hbs')


function isAuthenticated(req, res, next) {
    if (typeof req.headers.authorization !== "undefined") {
        let token = req.headers.authorization.split(" ")[1];
        let privateKey = "chaabi";
        // console.log(token);
        // Here we validate that the JSON Web Token is valid and has been
        // created using the same private pass phrase
        jwt.verify(token, privateKey, (err, user) => {

            // if there has been an error...
            if (err) {
                // shut them out!
                res.status(500).json({ error: "Not Authorized" });
                // throw new Error("Not Authorized");
            }
            // if the JWT is valid, allow them to hit
            // the intended endpoint
            req.user = user;
            next();
        });
    } else {
        // No authorization header exists on the incoming
        // request, return not authorized and throw a new error
        res.status(500).json({ error: "Not Authorized" });
        // throw new Error("Not Authorized");
    }
}

app.get('/auth/:uid/:pass' , (req , res) => {
  let uid = req.params.uid;
  let pass = req.params.pass;
  User.findOne({userId: uid} , (error , user) => {
    console.log(user);
    if(error || user == null)
    {
      res.sendStatus(403);
    }
    else if(pass === user.password)
    {
      let privateKey = 'chaabi';
      let token = jwt.sign({ userId : uid }, privateKey);
      res.json({token: token});
    }
    else
    {
      res.sendStatus(403);
    }
  })
})

app.get('/new/:uid/:pass' , (req , res) => {
  let uid = req.params.uid;
  let pass = req.params.pass;
  User.findOne({userId: uid} , (error , user) => {
    console.log(user);
    if(error || user == null)
    {
      let user = {userId: uid, password: pass};
      User.create(user , (error , new_user) => {
        console.log(new_user);
        res.json({msg: '<span class="text-success">Sign Up completed successfully!</span>'});
      })
    }
    else
    {
      res.json({msg: '<span class="text-danger">UserID already taken! Use a different UserID.</span>'});
    }
  })
})

// app.get('/jwt/:uid', function (req, res) {
//   let uid = req.params.uid;
//   let privateKey = 'chaabi';
//   let token = jwt.sign({ userId : uid }, privateKey);
//   res.json({token: token});
// })

app.get('/users', function (req, res) {
  try {
    User.find({} , (error , users) => {
      let uids = users.map((user) => user.userId);
      res.json(uids);
    });
  }
  catch (e) {
    res.sendStatus(404);
  }
})

app.get('/todos', isAuthenticated, function (req, res) {
  try {
    Todo.find({userId: req.user.userId} , (error , todos) => {
      res.json(todos);
    });
  }
  catch (e) {
    res.sendStatus(404);
  }
})

app.get('/todos/:id', isAuthenticated, function (req, res) {
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

app.put('/todos/:id', [bodyParser.json(), isAuthenticated] , function (req, res) {
  var id = req.params.id;

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

app.post('/todos/', [bodyParser.json(), isAuthenticated] , function (req, res) {

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
