/* PACKAGES */
var express = require('express');
var bodyParser = require('body-parser');
var exec = require('child_process').execFile; //for calling iperf3 locally
var rexec = require('remote-exec'); //for starting iperf3 server
var dns = require('dns');
var os = require('os');

var port = 3000;
var clientIp;
dns.lookup(os.hostname(), function (err, ip) {
  clientIp = ip;
});

var app = module.exports = express();
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.get('/clientIp', function(req, res) {
  res.status(200).send(clientIp);
});

app.post('/startServer', function(req, res) {
  var connection_options = {
    port: 22,
    username: req.body.username,
    password: req.body.password
  }

  rexec(req.body.serverIp, 'iperf3 -s', connection_options, function(err) {
    if (err) {
        console.log(err);
      } else {
        exec('./iperf/iperf3.exe', ['-c', req.body.serverIp, '-t', 1, '-J'], function(err, data) {
          if (err) {
            console.log(err);
            console.log(data.toString());
          } else {
            console.log('here');
            console.log(data.toString());
            res.status(200).send(data.toString());
          }
        });
      }
  });

});

/* SERVER */
app.listen(port, function() {
  console.log('port ' + port + ' is listening');
});
