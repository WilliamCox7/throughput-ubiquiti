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

//192.168.127.233
var switchedOn = false; var serverIp = '192.168.127.233';
var terminate = false;
var io = require('socket.io').listen(8080);
io.sockets.on('connection', function (socket) {
    setInterval(function() {
      if (switchedOn) {

        exec('./iperf/iperf3.exe', ['-c', serverIp, '-i', 1, '-t', 1, '-J'], function(err, data) {
          if (!err) {
            var d = JSON.parse(data);
            if (d) {
              var mbps = (d.intervals[0].streams[0].bits_per_second / 10000000).toFixed(1);
            }
          } else {
            console.log('err');
          }

          exec('./iperf/iperf3.exe', ['-c', serverIp, '-i', 1, '-t', 1, '-R', '-J'], function(errR, dataR) {
            if (!err) {
              var d = JSON.parse(dataR);
              if (d) {
                console.log(d.intervals[0]);
                var mbpsR = (d.intervals[0].streams[0].bits_per_second / 10000000).toFixed(1);
              }
              socket.emit('tcp', [mbps, mbpsR]);
            } else {
              console.log('err');
            }

            if (terminate) {
              console.log(username);
              var connection_options = {
                port: 22,
                username: username,
                password: password
              }
              rexec(serverIp, 'pkill iperf3', connection_options, function(err) {
                console.log('*******SERVER DISCONNECTED*******');
                console.log(err);
              });
              terminate = false;
            }

          });

        });

      }
    }, 1500);
});

var username, password;
app.post('/startServer', function(req, res) {
  username = req.body.username;
  password = req.body.password;
  var connection_options = {
    port: 22,
    username: username,
    password: password
  }
  serverIp = req.body.serverIp;
  rexec(serverIp, 'iperf3 -s', connection_options, function(err) {
    console.log('*******SERVER CONNECTED*******');
  });
  switchedOn = true;
  res.status(200).send('Server is connecting...');
});

app.post('/stopServer', function(req, res) {
  username = req.body.username;
  password = req.body.password;
  terminate = true;
  switchedOn = false;
  res.status(200).send('Server Disconnected...');
});

app.get('/getHistory', function(req, res) {
  var d = new Date();
  res.status(200).send([
    [d, 33.4],
    [d, 55.3]
  ]);
});

/* SERVER */
app.listen(port, function() {
  console.log('port ' + port + ' is listening');
});
