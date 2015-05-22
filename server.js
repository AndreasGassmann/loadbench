var http = require('http');
var fs = require('fs');
var _ = require('lodash');
var io = require('socket.io');

var requester = require("./requester");

var times = {};
times.success = [];
times.error = [];

var makeRequest = function() {
    requester.get("http://localhost/pm/public", function(error, response, url, time) {
        if (!error && response.statusCode == 200) {
            times.success.push({
                time: time
            });
        } else {
            times.error.push({});
        }

    });
};
setInterval(makeRequest, 100);

/*
threadPool.load('worker.js', function() {console.log("cb")});
threadPool.importScripts('worker.js');
threadPool.all.eval('var requester = require("./requester");');
threadPool.on('newResponse', function(data) {
    console.log(data);
    times.success.push({
        time: data
    });
});
*/


setInterval(function() {
    var localTimes = times;
    times = {}; times.success = []; times.error = [];
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
    console.log("new connection!");
});