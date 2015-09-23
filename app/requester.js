var fs = require('fs');
var request = require('request');

module.exports = {
  get: function(url, callback) {
    var start = process.hrtime();
    var myUrl = url + "?noCache=" + Math.random();

    var req = request.get(myUrl, { pool: { maxSockets: 10000 }, agent: false });

    req.on("response", function(response) {
      var elapsed = process.hrtime(start)[1] / 1000000;
      if (response.statusCode != 200) {
        callback(null, response, elapsed.toFixed(3));
      } else {
        // Save to file
        var stream = fs.createWriteStream("data/" + Math.round(Math.random() * 1000000000) + ".bin");
        stream.on("close", function(err) {
          // Only count as successfull if the stream didn't fail
          if (!err) {
            //console.log("Downloaded");
          } else {
            console.log("Stream error: " + err);
          }
        });
        req.pipe(stream);
        callback(null, response, elapsed.toFixed(3));
      }
    });
    // Error event
    req.on("error", function(err) {
      req.abort();
      var elapsed = process.hrtime(start)[1] / 1000000;
      console.log("Could not download: " + err);
      callback(err, null, elapsed.toFixed(3));
    });
    /*
    var resHandler = function (error, response, body) {
    var elapsed = process.hrtime(start)[1] / 1000000;
    if (error | (response && response.statusCode != 200)) {
    console.log("Request: " + elapsed.toFixed(3));
    if (response) console.log(response.statusCode);
    console.log(error);
  }
  callback(error, response, myUrl, elapsed.toFixed(3));
});*/
}
};
