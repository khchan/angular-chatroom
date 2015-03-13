'use strict';

app.factory('VideoStream', function ($q) {
  var stream;
  return {
    get: function () {
      if (stream) {
        return $q.when(stream);
      } else {
        var d = $q.defer();
        navigator.getUserMedia({video: true, audio: true}, function (data) {
          stream = data;
          d.resolve(stream);
        }, function (error) {
          d.reject(error);
        });
        return d.promise;
      }
    }
  };
});
