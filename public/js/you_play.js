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
      playerDiv.style.display = 'none';
      document.getElementsByTagName('BODY')[0].appendChild(playerDiv);

      _this.player = new YT.Player(playerDiv, {
        height: '390',
        width: '640',
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
  
  this.seekTo = function(time){ _this.player.seekTo(time / 1000, true); }
  this.play = function(id, time){
    _this.player.loadVideoById(id);
    if(time) _this.seekTo(time);
      
  }
  
})();



angular.module("YouPlay",[]).factory("yPlayer", function($rootScope){
  
  youPlay.whenEnded(function(){
    $rootScope.$apply(function(){
      $rootScope.$broadcast("yPlayer.songChanged", {});
    });
  });
  
  
  return {
    play: youPlay.play,
    seekTo: youPlay.seekTo
  }
  
});