var express = require("express")

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var request = require('request-json');
var client = request.newClient('http://gdata.youtube.com/');


app.use(express.static(__dirname + '/public'));


var queue = [];


app.get("/", function(req,res){
    res.render("index");
});


app.post("/",function(req, res){
    res.end("fuck " + req.body + req.params.test);
});


io.on('connection', function(socket){
  console.log('a user connected');
  
  socket.on('chat message', function(t){
      var video_id = t.url;
      
      client.get('feeds/api/videos/' + video_id + '?v=2&alt=jsonc', function(err, res, body){
        if(err) return;   
        var song = {
          url: video_id,
          title: body.data.title,
          image: body.data.thumbnail.sqDefault,
          duration: body.data.duration
        }
        queue.push(song);
        io.emit("queue.changed", queue);
      });
      
      
  }); 
    
  io.emit("queue.changed", queue);
});



http.listen(process.env.PORT || 3000, '0.0.0.0', function(){
  console.log('listening on *:3000');
});
