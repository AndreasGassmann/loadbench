var static = require('node-static');
var http = require('http');
var fs = require('fs');
var _ = require('lodash');
var io = require('socket.io');
var fork = require('child_process').fork;

var workers = [];

var nofTotalRequests = 0;

var times = {};
times.success = [];
times.error = [];

var workerMessage = function(x) {
  return function(response) {
    if (response.log) {
      console.log("Message from worker " + x + ": " + response.msg);
    } else {
      nofTotalRequests++;
      if (response.success) {
          times.success.push({time: response.time});
      } else {
          times.error.push({});
      }
    }
  };
};

var initWorkers = function(nofWorkers, callback) {
  workers = [];
  for (var x = 0; x < nofWorkers; x++) {
      workers[x] = fork(__dirname + '/app/worker.js');
      workers[x].on('message', workerMessage(x));
  }
  callback();
}

var setStatus = function(status, url, nofWorkers, nofParallel) {
  if (status) {
    initWorkers(nofWorkers, function() {
      for (var x = 0; x < nofWorkers; x++) {
        workers[x].send({status: status, url: url, requestsPerSecond: nofParallel});
      }
    });
  } else {
    for (var x = 0; x < nofWorkers; x++) {
      workers[x].send({status: status});
    }
  }
};

var interval = setInterval(function() {
    var localTimes = times;
    times = {}; times.success = []; times.error = [];
    console.log("-------");
    console.log("Total Requests: " + nofTotalRequests);
    console.log("Success: " + localTimes.success.length);
    console.log("Error: " + localTimes.error.length);
    if (localTimes.success.length) {
        console.log(_.sum(localTimes.success, 'time') / localTimes.success.length);
        socket.emit('newData', {
            success: localTimes.success.length,
            error: localTimes.error.length,
            averageResponseTime: _.sum(localTimes.success, 'time') / localTimes.success.length
        });
    }
}, 1000);


var file = new static.Server('./public');
var server = http.createServer(function (request, response) {
    request.addListener('end', function () {
        file.serve(request, response);
    }).resume();
}).listen(1337);

var socket = io.listen(server);

socket.on('connection', function(socket) {
    socket.on('run', function(data){
        console.log(data);
        setStatus(data.status, data.url, data.nofProcesses, data.nofRequestsPerProcessPerSecond);
    });
});
