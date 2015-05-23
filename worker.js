var requester = require("./requester");

var makeRequest = function() {
    requestsStarted++;
    requester.get("http://localhost/pm/public/", function(error, response, url, time) {
        requestsResponded++;
        if (!error && response.statusCode == 200) {
            process.send({success: true, time: time});
        } else {
            process.send({success: false, time: time});
        }
    });
};

var requestsStarted = 0;
var requestsResponded = 0;
var myInterval;
var isRequesting = false;

var startRequests = function() {
    if (!isRequesting) {
        isRequesting = true;
        myInterval = setInterval(makeRequest, 100);
    }
};


process.on('message', function(m) {
    if (m.status) {
        startRequests();
    } else {
        clearInterval(myInterval);
        isRequesting = false;
        console.log(requestsResponded + "/" + requestsStarted);
    }
});