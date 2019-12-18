
var express = require('express')
var app = express()

var fs = require('fs')
var path = require('path')
var _ = require('lodash')
var engines = require('consolidate')
var cors = require('cors')
var bodyParser = require('body-parser')

app.use(cors())

var data;

function getDataFilePath (id , dir) {
  return path.join(__dirname, dir, dir.substr(0,4)+ "_" + id) + '.json';
}

function getData (id , dir) {
  var result = JSON.parse(fs.readFileSync(getDataFilePath(id , dir), {encoding: 'utf8'}));
  return result;
}

function saveData (id , dir , data) {
  var fp = getDataFilePath(id , dir)
  fs.unlinkSync(fp) // delete the file
  fs.writeFileSync(fp, JSON.stringify(data), {encoding: 'utf8'})
}

app.engine('hbs', engines.handlebars)

app.set('views', './views')
app.set('view engine', 'hbs')

app.get('/:dir', function (req, res) {
  var todos = [];
  var dir = req.params.dir;
  try {
    fs.readdir(dir, function (err, files) {
      if(!files)
        throw "DirectoryNotFound";
      files.forEach(function (file) {
        fs.readFile(path.join(__dirname, dir, file), {encoding: 'utf8'}, (err, data) => {
          var todo = JSON.parse(data);
          todos.push(todo);
          if (todos.length === files.length)
            res.json(todos);
        })
      })
    })
  }
  catch (e) {
    res.sendStatus(404);
  }
})

app.get('/:dir/:id', function (req, res) {
  var id = req.params.id;
  var dir = req.params.dir;
  try {
    var data = getData(id , dir);
    res.send(data);
  }
  catch (e) {
    res.sendStatus(404);
  }
})

app.put('/:dir/:id', bodyParser.json() , function (req, res) {
  var id = req.params.id;
  // console.log(id)
  var dir = req.params.dir;
  // console.log(dir)
  data = getData(id , dir);
  // console.log(data)
  data.userId = req.body.userId ? req.body.userId : data.userId;
  data.title = req.body.title ? req.body.title : data.title;
  data.completed = req.body.completed ? req.body.userId : data.completed;
  // console.log(data)
  saveData(id , dir , data);
  res.json(data);
  // res.end()
})

app.post('/:dir/', bodyParser.json() , function (req, res) {
  // var id = req.params.id;
  // console.log(id)
  var dir = req.params.dir;
  // console.log(dir)
  // var data = getData(id , dir);
  // console.log(data)
  var id;
  fs.readdir(dir, (err, files) => {
    id = files.length + 1;
    data = req.body;
    data.id = id;
    data.userId = req.body.userId ? req.body.userId : data.userId;
    data.title = req.body.title ? req.body.title : data.title;
    data.completed = req.body.completed ? req.body.userId : data.completed;
    console.log(id);
    var fp = dir + "/" + dir.substr(0,4)+ "_" + id + '.json';
    console.log(fp);
    fs.open(fp , "w" , () => {});
    saveData(id , dir , data);
    res.json(data);
    // res.end()
  });
})

app.delete('/:dir/:id', function (req, res) {
  var fp = getDataFilePath(req.params.id , req.params.dir);
  fs.unlinkSync(fp);
  res.sendStatus(200);
})

var server = app.listen(3000, function () {
  console.log('Server running at http://localhost:' + server.address().port)
})
