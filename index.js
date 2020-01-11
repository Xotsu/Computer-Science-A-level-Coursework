var list = [];

 class Player{
   constructor(id){
     this.id = id;
   }
 }

var numberOfPlayers = 0
//import modules for the webserver and sockets
var express = require('express');
var socket = require('socket.io');
var sqlite3 = require('sqlite3').verbose();
var app = express();
//webserver code

var server = app.listen(3333, function() {
  console.log('listening for requests ');
});

app.use(express.static('public'));


var io = socket(server);

io.on('connection', function(socket) {

  if(numberOfPlayers % 2 === 0){
    p = new Player(socket.id);
    list.push([p]);
    numberOfPlayers ++;
  }else{
    p = new Player(socket.id);
    list[list.length-1].push(p);
    numberOfPlayers ++;
  }
  //console.log('made socket connection', socket.id);
  //console.log(list);
  //
  socket.on('addScore', function(data) {
    console.log(data)
    let sql = `INSERT INTO HighScores (Names,Score) VALUES ("${data.name}",${data.score});`;
    console.log(sql)
    runQuery(sql)
  });


  socket.on('getScores', function() {

    //let sql = `SELECT * FROM scores`;
    let sql = 'SELECT * FROM HighScores ORDER BY SCORE DESC LIMIT 5;'
    console.log(sql)
    db.all(sql, [], (err, rows) => {
      if (err) {
        throw err;
      }
      socket.emit('top5',rows)
      rows.forEach((row) => {
        console.log(row);
      });
    });
    //runQuery(data)
  });
  socket.on('drawing', function(data) {
    //console.log('drawing')


    for (x = 0; x<list.length; x ++){
      for (y= 0; y<list[x].length; y ++){
        //console.log(list[x][y]);
        if (list[x][y].id == socket.id){
          //console.log(list[x][y], socket.id);

          //console.log("emmiting");
          //console.log(socket.id);
          //console.log(list[x].length);
          if(list[x].length == 2){
            socket.to(list[x][1-y].id).emit("drawing", data);
          }else{
            //console.log("implement waiting for player: no - future me")
          }
      }
    }


    }
  });
});
let db = new sqlite3.Database('HighScores.db');
let sql = `SELECT * FROM HighScores`;

function runQuery(sql) {
  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
    rows.forEach((row) => {
      console.log(row);
    });
  });
}
runQuery(sql)
