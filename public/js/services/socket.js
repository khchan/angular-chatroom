'use strict';

/* Simple Socket Services */

app.factory('socket', function ($rootScope) {
  
  return {
    io: function() {
      if (typeof io === 'undefined') {
        throw new Error('Socket.io required');
      }
      return io;  
    },    
    on: function (eventName, callback) {
      var socket = io.connect();
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      var socket = io.connect();
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});
