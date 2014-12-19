angular.module("musicBox", ['YouPlay', 'mm.foundation']).

controller("QueueController", function($scope, yPlayer, $http){
  var socket = io();
  $scope.waiting = true;
  $scope.newSongId = 'Tm88QAI8I5A';
  
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
  });
  
  $scope.addNewSong = function(){
    socket.emit('queue.append', { id: $scope.newSong.id });
    $scope.newSong = '';
  }
  
  $scope.activeSongs = function(){
    if(!$scope.queueState || !$scope.queueState.currentSong) return null;
    var result = []
    angular.forEach($scope.queueState.songs, function(song, i){
      if(i >= $scope.queueState.currentSong.song_index) result.push(song);
    });
    return result;
  };
  
  
  
  $scope.getVideos = function(val) {
    return $http.get('https://gdata.youtube.com/feeds/api/videos', {
      params: {
        q: val,
        'max-results': 10,
        alt: 'json',
        v: 2
      }
    }).then(function(res){
      var videos = [];
      angular.forEach(res.data.feed.entry, function(item){
        videos.push({
          id: item.media$group.yt$videoid.$t,
          title: item.title.$t,
          image: item.media$group.media$thumbnail[0].url,
          toString: function(){ return this.title; }
        });
      });
      return videos;
    });
  }
  
  //link changes
  socket.on('queue.changed', function(queue){
    $scope.$apply(function(){ 
      $scope.queueState = queue;
      console.log("Have queue", queue);
      if($scope.waiting) $scope.play();                      
    });
  });
  //request queue data
  socket.emit('queue.get');
  
});








