var request = require('request');

module.exports = {
    get: function(url, callback) {
        var start = process.hrtime();
        var myUrl = url + "?noCache=" + Math.random();
        request.get(myUrl, function (error, response, body) {
            var elapsed = process.hrtime(start)[1] / 1000000;
            callback(error, response, myUrl, elapsed.toFixed(3));
        });
    }
};