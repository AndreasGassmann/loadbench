var requester = require("./requester");

var makeRequest = function(url) {
  return function() {
    requestsStarted++;
    requester.get(url, function(error, response, time) {
        requestsResponded++;
        if (!error && response.statusCode == 200) {
            process.send({success: true, time: time});
        } else {
          console.log(error);
          if (response) console.log(response.statusCode);
          process.send({success: false, time: time});
        }
    });
  };
};

var requestsStarted = 0;
var requestsResponded = 0;
var myInterval;
var isRequesting = false;

var startRequests = function(url, requestsPerSecond) {
    if (!isRequesting) {
        isRequesting = true;
        myInterval = setInterval(makeRequest(url), 1000/requestsPerSecond);
    }
};


process.on('message', function(m) {
    if (m.status) {
        startRequests(m.url, m.requestsPerSecond);
    } else {
        clearInterval(myInterval);
        isRequesting = false;
        process.send({log: true, msg: requestsResponded + "/" + requestsStarted});
    }
});
