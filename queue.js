var Q = require("q");
var request = require('request-json');
var client = request.newClient('http://gdata.youtube.com/');

function Queue(){
  var _this = this;
  var songs = [];
  var activeSong = -1;
  var playing = false;
  
  function calcDatePlay(){
    if(songs.length > 0){
       var lastSong = songs[songs.length - 1];
       return new Date(Math.max(new Date(), new Date(lastSong.datePlay.getTime() + lastSong.duration)));
    }
    else return new Date();
  }
  
  //adding new song
  this.add = function(song_req){
    var deferred = Q.defer();
    
    //load form youtube
    client.get('feeds/api/videos/' + song_req.video_id + '?v=2&alt=jsonc', function(err, res, body){
      if(err != null || body.error != null) return deferred.reject(new Error("Invalid youtube video"));
      
      var song = {
          id: song_req.video_id,
          title: body.data.title,
          image: body.data.thumbnail.sqDefault,
          dateAdded: new Date(),
          duration: body.data.duration * 1000,
      };
      
      if(!song.duration || !song.id) return deferred.reject(new Error("Invalid youtube video format"));
      song.datePlay = calcDatePlay()
      songs.push(song);
      deferred.resolve(_this.getState());
    });
    
    return deferred.promise;
  }
  
  
  this.getCurrentSong = function(){
      var currentSong = null;
      var now = new Date();
      
      for(var i= songs.length -1; i != -1; i--){
        if(songs[i].datePlay <= now){
          //we have the song, check if it's ended
          var milPlaying = now - songs[i].datePlay;
          if(songs[i].duration < milPlaying)
            return null;
          else 
            return {song_index: i, played: milPlaying };
        }
      }
      return null; 
  }
  
  this.getState = function(){
    return {
      songs: songs,
      currentSong: _this.getCurrentSong()
    }
  }
}






module.exports =  Queue;