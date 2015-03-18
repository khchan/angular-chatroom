var moniker = require('moniker'),
    randomColor = require('randomcolor'),
    userNames = require('./users'),
    users = userNames.roomUsers,
    rooms = {};

// export function for listening to the socket
module.exports = function (socket) {
  
  var currentRoom, id;
  var name = userNames.getGuestName();

  // Chat Related Socket Handers
  // ===============================
  
  // broadcast a user's message to other users
  socket.on('send:message', function (data) {
    socket.broadcast.to(currentRoom).emit('send:message', {
      user: name,
      text: data.message,
      time: new Date()
    });
  });

  // validate a user's name change, and broadcast it on success
  socket.on('change:name', function (data, cb) {
    if (userNames.claim(data.name)) {
      var oldName = name;
      userNames.free(oldName, currentRoom);
      name = data.name;
      users[currentRoom][name] = true;
      
      socket.broadcast.to(currentRoom).emit('change:name', {
        oldName: oldName,
        newName: name
      });

      cb(true);
    } else {
      cb(false);
    };
  });

  // clean up when a user leaves, and broadcast it to other users
  socket.on('disconnect', function () {
    socket.broadcast.to(currentRoom).emit('user:left', {
      name: name
    });
    userNames.free(name, currentRoom);

    // remove user from room and broadcast
    if (!currentRoom || !rooms[currentRoom]) {
      return;
    }
    delete rooms[currentRoom][rooms[currentRoom].indexOf(socket)];

    rooms[currentRoom].forEach(function (socket) {
      if (socket) {
        socket.emit('peer.disconnected', { id: id });
      }
    });
  });

  // Video Chat Related Handlers
  // ===========================

  socket.on('initRTC', function (data, cb) {
    var roomName = moniker.generator([moniker.verb, moniker.adjective, moniker.noun]).choose();
    currentRoom = (data || {}).room || roomName;
    var room = rooms[currentRoom];
    
    socket.room = currentRoom;
    if (!users[currentRoom])
      users[currentRoom] = {};
    users[currentRoom][name] = true;
    socket.join(currentRoom);
    
    // Room not created yet
    if (!data) {
      // create initial list of sockets and names at the hash of currentRoom
      rooms[currentRoom] = [socket];
      id = rooms[currentRoom].users = 0;
      cb(currentRoom, id);
      console.log('Room created, with #', currentRoom);
    } 
    // Join an existing room
    else {
      if (!room) {
        return;
      }
      rooms[currentRoom].users += 1;
      id = rooms[currentRoom].users;
      cb(currentRoom, id);
      // announce to each socket connected to this current room
      room.forEach(function (s) {
        s.emit('peer.connected', { id: id });
      });
      room[id] = socket;
      console.log('Peer connected to room', currentRoom, 'with #', id);
    }

    // send the new user their name and a list of users
    socket.emit('init', {
      name: name,
      users: userNames.getInRoom(currentRoom)
    });  
    
    // notify other clients that a new user has joined
    socket.broadcast.to(currentRoom).emit('user:join', {
      name: name
    });
  });

  socket.on('msg', function (data) {
    var to = parseInt(data.to, 10);
    if (rooms[currentRoom] && rooms[currentRoom][to]) {
      rooms[currentRoom][to].emit('msg', data);
    } else {
      console.warn('Invalid user');
    }
  });
};
