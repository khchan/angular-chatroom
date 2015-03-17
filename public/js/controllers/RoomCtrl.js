'use strict';

app.controller('RoomCtrl', function ($rootScope, $scope, $sce, VideoStream, $location, $routeParams, $mdToast, Room) {

  var stream;
  $scope.error = false;
  $scope.peers = [];
  
  if (!window.RTCPeerConnection || !navigator.getUserMedia) {
    $rootScope.vidError = true;
    $mdToast.show($mdToast.simple()
      .content('WebRTC is not supported by your browser. You can try the app with Chrome and Firefox.')
      .action('OK')
      .hideDelay(0)
      .position('bottom left'));
    return;
  }  

  VideoStream.get().then(function(data) {
    stream = data;
    Room.init(stream);
    stream = URL.createObjectURL(stream);
  }, function () {
    $rootScope.vidError = true;
    $mdToast.show($mdToast.simple()
      .content('No audio/video permissions. Please refresh your browser and allow the audio/video capturing.')
      .action('OK')
      .hideDelay(0)
      .position('bottom left'));
  }).then(function() {
    if (!$routeParams.roomId) {
      Room.createRoom().then(function (roomId) {
        $location.path('/room/' + roomId);
      });
    } else {
      Room.joinRoom($routeParams.roomId);
    }
  });

  Room.on('peer.stream', function (peer) {
    console.log('Client connected, adding new stream');
    $scope.peers.push({
      id: peer.id,
      stream: URL.createObjectURL(peer.stream)
    });
  });
  
  Room.on('peer.disconnected', function (peer) {
    console.log('Client disconnected, removing stream');
    $scope.peers = $scope.peers.filter(function (p) {
      return p.id !== peer.id;
    });
  });

  $scope.getLocalVideo = function () {
    return $sce.trustAsResourceUrl(stream);
  };
});
