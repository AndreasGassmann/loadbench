var http = require('http');
var fs = require('fs');
var _ = require('lodash');
var io = require('socket.io');

var requester = require("./requester");

var fork = require('child_process').fork;

var workers = [];

var nofTotalRequests = 0;

for (var x = 0; x < 5; x++) {
    workers[x] = fork(__dirname + '/worker.js');
    workers[x].on('message', function(response) {
        nofTotalRequests++;
        if (response.success) {
            times.success.push({time: response.time});
        } else {
            times.error.push({});
        }
    });
}

var setStatus = function(status, nofThreads, nofParallel) {
    for (var x = 0; x < nofThreads; x++) {
        workers[x].send({status: status, threads: nofThreads, requestsPerSecond: nofParallel});
    }
};

var times = {};
times.success = [];
times.error = [];

setInterval(function() {
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

var index = fs.readFileSync('index.html');
var server = http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(index);
}).listen(1337);

var socket = io.listen(server);

socket.on('connection', function(socket) {
    socket.on('run', function(data){
        console.log(data);
        setStatus(data.status, data.nofProcesses, data.nofRequestsPerProcessPerSecond);
    });
});