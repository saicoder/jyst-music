'use strict';

window.youPlay = new (function(){
  var _this = this,
      loaded = false,
      ready = false,
      onReady = null,
      onVideoEnds;
  
  
  function onPlayerReady(){
    console.log("Player Ready");
    ready = true;
    if(onReady && loaded && ready)onReady();
  }
  
  function onPlayerStateChange(event){
    if(event.data == 0 && onVideoEnds) onVideoEnds();
  }
  
  window.onYouTubePlayerAPIReady = function(){
    loaded = true;
    
    angular.element(document).ready(function() {
      var playerDiv = document.createElement("DIV");
//      playerDiv.style.display = 'none';
      var playerView = document.getElementById('player-view');
      playerView.appendChild(playerDiv);
      playerView.style.width = '300px'
      playerView.style.height = '169px'
      
      _this.player = new YT.Player(playerDiv, {
        height: 169,
        width: 300,
        playerVars: {
          controls: 0,
          disablekb: true,
          rel: 0,
          showinfo: false,
          //origin:''
        },
        events: { 'onReady': onPlayerReady, 'onStateChange': onPlayerStateChange }
      }); 
    });
  };
  
  //api =============================
  this.whenLoaded = function(func){
    if(loaded && ready)func();
    else onReady = func;
  }
  this.whenEnded = function(func){ onVideoEnds = func; }
  
  this.seekTo = function(time){ if(_this.player)_this.player.seekTo(time / 1000, true); }
  this.play = function(id, time){
    if(_this.player) _this.player.loadVideoById(id);
    if(time) _this.seekTo(time);
      
  }
  
})();



angular.module("YouPlay",[]).factory("yPlayer", ['$rootScope', function($rootScope){
  
  youPlay.whenEnded(function(){
    $rootScope.$apply(function(){
      $rootScope.$broadcast("yPlayer.songChanged", {});
    });
  });
  
  setInterval(function(){
    if(youPlay.player.getPlayerState() != 1) return; //playing
    
    $rootScope.$apply(function(){
      $rootScope.$broadcast("yPlayer.timeChanged", youPlay.player.getCurrentTime() * 1000);
    });
  
  },1000);
  
  return {
    play: youPlay.play,
    seekTo: youPlay.seekTo,
    mute: function(val){
      if(typeof val == 'undefined') return youPlay.player.isMuted();
      if(val) youPlay.player.mute();
      else youPlay.player.unMute();
    }
  }
  
}]);