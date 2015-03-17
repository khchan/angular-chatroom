var moniker = require('moniker'),
    randomColor = require('randomcolor');

var userNames = (function () {
  var roomUsers = {},
      names = {};

  return {
    roomUsers: roomUsers,

    claim: function (name) {
      if (!name || names[name]) {
        return false;
      } else {
        names[name] = true;
        return true;
      }
    },

    // find the lowest unused "guest" name and claim it  
    getGuestName: function () {
      var name;
      do {
        name = moniker.choose();
      } while (!this.claim(name));
      return name;
    },

    // serialize claimed names as an array
    getInRoom: function (room) {
      var res = [];
      for (user in roomUsers[room]) {
        res.push({user: user, colour: randomColor({luminosity: 'dark', hue: 'random'})});
      }
      return res;
    },

    free: function (name, room) {
      if (names[name]) {
        delete names[name];
      }
      if (roomUsers[room][name]) {
        delete roomUsers[room][name];
      }
    }
  };
}());  

module.exports = userNames;