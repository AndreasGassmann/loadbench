var request = require('request');

module.exports = {
    get: function(url, callback) {
        var start = process.hrtime();
        var myUrl = url + "?noCache=" + Math.random();
        request.get(myUrl, function (error, response, body) {
            if (!error && response.statusCode == 200) {} else {
                console.log(error);
                console.log(response);
                console.log(body);
            }
            var elapsed = process.hrtime(start)[1] / 1000000;
            callback(error, response, myUrl, elapsed.toFixed(3));
        });
    }
};