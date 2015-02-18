var express = require("express")
var http = require('http')

var app = express()
var server = http.createServer(app)
var io = require('socket.io').listen(server)


var clientDir = '/public';//(process.env.NODE_ENV == 'production')? '/dist': '/public'
app.use(express.static(__dirname + clientDir))



//app specific

var queue = new (require('./queue')) ()

var conected_users = 0;

io.on('connection', function(socket){
  console.log('a user connected')
  conected_users ++;
  io.emit("conected_users.changed", {count: conected_users});
  
  //append song
  socket.on('queue.append', function(t){
  
      queue.add({video_id: t.id}).then(function(state){
        io.emit("queue.changed", state);
      }, function(error){
        console.log("Invalid video");
      });
    
  });
  
  //get songs
  socket.on('queue.get', function(){
    socket.emit("queue.changed", queue.getState());
  })
  
  socket.on('disconnect', function() { 
    conected_users--;
    io.emit("conected_users.changed", {count: conected_users});
  });
})




var port = process.env.PORT || 3000
server.listen(port, function(){
  console.log('listening on *:' + port + ' in ' + (process.env.NODE_ENV || 'dev') )
})




