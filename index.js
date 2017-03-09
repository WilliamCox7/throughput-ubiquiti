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

var switchedOn = false; serverIp = null;
var io = require('socket.io').listen(8080);
io.sockets.on('connection', function (socket) {
    setInterval(function() {
      if (switchedOn) {
        exec('./iperf/iperf3.exe', ['-c', serverIp, '-i', 1, '-t', 1, '-J'], function(err, data) {
          if (!err) {
            var d = JSON.parse(data);
            var mbps = (d.intervals[0].streams[0].bits_per_second / 10000000).toFixed(1);
            socket.emit('tcp', mbps);
          }
        });
      }
    }, 1500);
});

app.post('/startServer', function(req, res) {
  var connection_options = {
    port: 22,
    username: req.body.username,
    password: req.body.password
  }
  serverIp = req.body.serverIp;
  rexec(serverIp, 'iperf3 -s', connection_options, function(err) {
    switchedOn = true;
  });
  res.status(200).send('Server is connecting...');
});

/* SERVER */
app.listen(port, function() {
  console.log('port ' + port + ' is listening');
});
