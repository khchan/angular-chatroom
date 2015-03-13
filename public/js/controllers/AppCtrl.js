'use strict';

/* Controllers */
app.controller('AppCtrl', function($scope, socket, $mdSidenav) {

  // Socket listeners
  // ================

  socket.on('init', function (data) {
    $scope.name = data.name;
    $scope.users = data.users;
  });

  socket.on('send:message', function (message) {
    $scope.messages.push(message);
  });

  socket.on('change:name', function (data) {
    changeName(data.oldName, data.newName);
  });

  socket.on('user:join', function (data) {
    $scope.messages.push({
      user: 'chatroom',
      text: 'User ' + data.name + ' has joined.'
    });
    $scope.users.push({user: data.name, colour: $scope.getUserColour(data.name)});
  });

  // add a message to the conversation when a user disconnects or leaves the room
  socket.on('user:left', function (data) {
    $scope.messages.push({
      user: 'chatroom',
      text: 'User ' + data.name + ' has left.'
    });
    var i, user;
    for (i = 0; i < $scope.users.length; i++) {
      user = $scope.users[i];
      if (user.user === data.name) {
        $scope.users.splice(i, 1);
        break;
      }
    }
  });

  // Private helpers
  // ===============

  var changeName = function (oldName, newName) {
    // rename user in list of users
    var i;
    for (i = 0; i < $scope.users.length; i++) {
      if ($scope.users[i].user === oldName) {
        $scope.users[i].user = newName;
      }
    }

    $scope.messages.push({
      user: 'chatroom',
      text: 'User ' + oldName + ' is now known as ' + newName + '.'
    });
  };

  $scope.getUserColour = function(username) {
    var i;
    for (i=0; i < $scope.users.length; i++) {
      if ($scope.users[i].user == username) {
        return $scope.users[i].colour;
      }
    }
  };

  // Methods published to the scope
  // ==============================
  
  $scope.error = false;

  $scope.keyPress = function(event) {
    if (event.keyCode === 13) { // enter key
      event.preventDefault();
      $scope.sendMessage();
    } else if (event.keyCode === 10) { // ctrl enter
      $scope.message += '\n';
    }
  };

  $scope.toggleRight = function() {
    $mdSidenav('right').toggle();
  };

  $scope.changeName = function () {
    socket.emit('change:name', {
      name: $scope.newName
    }, function (result) {
      if (!result) {
        alert('There was an error changing your name');
      } else {        
        changeName($scope.name, $scope.newName);

        $scope.name = $scope.newName;
        $scope.newName = '';
      }
    });
  };

  $scope.messages = [];

  $scope.sendMessage = function () {
    if ($scope.message) {
      socket.emit('send:message', {
        message: $scope.message
      });

      // add the message to our model locally
      $scope.messages.push({
        user: $scope.name,
        colour: $scope.getUserColour($scope.name),
        text: $scope.message,
        time: new Date()
      });

      // clear message box
      $scope.message = '';
    }
  };
});