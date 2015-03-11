'use strict';

var app = angular.module('myApp', [
  'ngMaterial', 
  'ngRoute',
  'angularMoment',
  'luegg.directives'
]);

app.config(function ($routeProvider) {
  $routeProvider
    .when('/room/:roomId', {
      templateUrl: 'partials/room.html',
      controller: 'RoomCtrl'
    })
    .when('/room', {
      templateUrl: 'partials/room.html',
      controller: 'RoomCtrl'
    })
    .otherwise({
      redirectTo: '/room'
    });
});

app.constant('config', {
  SIGNALING_SERVER_URL: undefined
});

Object.setPrototypeOf = Object.setPrototypeOf || function(obj, proto) {
  obj.__proto__ = proto;
  return obj; 
};
