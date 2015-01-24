angular.module("musicBox", ['YouPlay', 'ngMaterial']).

controller("QueueController", ['$scope', 'yPlayer', '$http', function($scope, yPlayer, $http){
  //document.getElementById('player-view').appendChild(document.getElementsByTagName('iframe')[0])
  
  var socket = io();
  $scope.elipsed = 0.01;
  $scope.waiting = true;
  $scope.activeSongs = [];
  
  $scope.play = function(){
    if($scope.queueState.currentSong == null) return;
    var currentSong = $scope.queueState.songs[$scope.queueState.currentSong.song_index];
    yPlayer.play(currentSong.id, $scope.queueState.currentSong.played);
    $scope.waiting = false;
  }
  
  $scope.$on('yPlayer.songChanged', function(a,b){
    console.log(a,b);
    $scope.queueState.currentSong.song_index += 1;
    $scope.queueState.currentSong.played = 0;
    
    var nextSong = $scope.queueState.songs[ $scope.queueState.currentSong.song_index];
    
    if(nextSong) yPlayer.play(nextSong.id);
    else $scope.waiting = true;
    
    $scope.reloadActiveSongs()
  });
  
  $scope.$on('yPlayer.timeChanged', function(e, time){
    
    if( $scope.songPlaying == null) return;
    $scope.elipsedms = time;
    $scope.elipsed = Math.floor((time /  $scope.songPlaying.duration) * 100)
    
  });
  //mute unmute
  $scope.toggleMute = function(){ $scope.muted = !$scope.muted; yPlayer.mute($scope.muted); }
  
  
  $scope.getDuration = function(mils){
    mils = mils / 1000;
    return Math.floor(mils/60) + ':' + ('0'+ Math.floor(mils % 60 )).slice(-2)
  }
  
  $scope.addNewSong = function(song){
    console.log("add song", $scope.newSong);
    socket.emit('queue.append', { id: song.id });
    $scope.newSongName = '';
  }
  
  $scope.reloadActiveSongs = function(){
    if(!$scope.queueState || !$scope.queueState.currentSong) return null;
    var result = []
    angular.forEach($scope.queueState.songs, function(song, i){
      if(i > $scope.queueState.currentSong.song_index) result.push(song);
    });
    
    $scope.songPlaying = $scope.queueState.songs[$scope.queueState.currentSong.song_index]
    $scope.activeSongs = result;
  };
  
  
  $scope.newSongName = "";
  $scope.$watch('newSongName', function(){
    if($scope.newSongName.length == 0) $scope.searchActive = false;
    else {
      $scope.searchActive = true;
      $scope.getVideos(); 
    }
  });
  
  $scope.getVideos = function() {
    return $http.get('https://gdata.youtube.com/feeds/api/videos', {
      params: {
        q: $scope.newSongName,
        'max-results': 10,
        alt: 'json',
        format: 5, //only videos that can be embeded
        v: 2
      }
    }).then(function(res){
      var videos = [];
      angular.forEach(res.data.feed.entry, function(item){
        if(!item.media$group.media$content)return;
        
         videos.push({
          id: item.media$group.yt$videoid.$t,
          title: item.title.$t,
          image: item.media$group.media$thumbnail[0].url,
          toString: function(){ return this.title; },
          duration: item.media$group.yt$duration.seconds * 1000
        });
      });
      $scope.searchResults = videos;
    });
  }
  
  //link changes
  socket.on('queue.changed', function(queue){
    $scope.$apply(function(){ 
      $scope.queueState = queue;
      console.log("Have queue", queue);
      if($scope.waiting) $scope.play();    
      $scope.reloadActiveSongs()
    });
  });
  
  socket.on('conected_users.changed', function(connected_users){
    $scope.$apply(function(){ $scope.connected_users = connected_users; });
  });
  
  //request queue data
  socket.emit('queue.get');
  
}]);








