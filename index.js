/* PACKAGES */
var express = require('express');
var bodyParser = require('body-parser');
var exec = require('child_process').execFile; // for calling iperf3 locally
var rexec = require('remote-exec'); // for starting iperf3 server
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var dns = require('dns');
var os = require('os');

/* OTHER VARS */
var port = 3000;
var url = 'mongodb://localhost:27017/tcphistory';
var username, password; // stores credentials from client input
var clientIp; //client ip retrived from users computer

/* APP */
var app = module.exports = express();
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

/* MONGODB FUNCTIONS */
exec('./mongo/mongod.exe');
exec('./mongo/mongo.exe');
// inserts tcp into either upstream or downstream document
var insertDocuments = function(db, callback, mbps, coll) {
  var date = new Date();
  var collection = db.collection(coll);
  collection.insertOne({
    date: date, mbps: mbps
  }, function(err, result) {
    assert.equal(err, null);
    callback(result);
  });
}

/* SOCKET.IO */
var serverIp; // 192.168.127.233
var switchedOn = false; //boolean to manage socket.io. If true, emit tcp to client
var terminate = false; //boolean to manage stop command on client. If true, kill iperf server
var io = require('socket.io').listen(8080);
io.sockets.on('connection', function (socket) {

    // interval set to 1.5 seconds (send tcp every 1.5 seconds)
    setInterval(function() {
      if (switchedOn) {

        // run iperf3 locally
        // -c iperf server (input from client)
        // -i 1 (interval set to 1)
        // -t 1 (time set to 1 second)
        // -J (get data in JSON format)
        exec('./iperf/iperf3', ['-c', serverIp, '-i', 1, '-t', 1, '-J'], function(err, data) {

          //error may occur due to set interval and frequent calls
          if (!err) {

            // get parsed data and retrieve mbps
            var d = JSON.parse(data);
            if (d) { var mbps = (d.intervals[0].streams[0].bits_per_second / 1000000).toFixed(1); }

            // store mbps in upstream document
            MongoClient.connect(url, function(err, db) {
              assert.equal(null, err);
              insertDocuments(db, function(result) {
                db.close();
              }, mbps, 'upstream');
            });

          }

          // run iperf3 locally
          // -c iperf server (input from client)
          // -i 1 (interval set to 1)
          // -t 1 (time set to 1 second)
          // -R (reverse direction of throughput)
          // -J (get data in JSON format)
          exec('./iperf/iperf3', ['-c', serverIp, '-i', 1, '-t', 1, '-R', '-J'], function(errR, dataR) {

            //error may occur due to set interval and frequent calls
            if (!errR) {

              // get parsed data and retrive mbps
              var d = JSON.parse(dataR);
              if (d) { var mbpsR = (d.intervals[0].streams[0].bits_per_second / 1000000).toFixed(1); }

              // store mbps in downstream document
              MongoClient.connect(url, function(err, db) {
                assert.equal(null, err);
                insertDocuments(db, function(result) {
                  db.close();
                }, mbpsR, 'downstream');
              });

              // once mbps has been retrieved and stored for both up/downstream emit to client
              socket.emit('tcp', [mbps, mbpsR]);
            }

            // if stop button on client is clicked, terminate will be set to true
            // when true, iperf server will terminate
            // placed here to run after socket.io finishes emitting tcp
            if (terminate) {
              var connection_options = { port: 22, username: username, password: password }
              rexec(serverIp, 'pkill iperf3', connection_options);
              terminate = false;
            }

          }); // end of exec (downstream)

        }); // end of exec (upstream)

      } // end of if (switchedOn) {

    }, 1500); // end of setInterval

}); // end of socket.io

/* ENDPOINTS */

// CLIENT IP ENDPOINT
// gets ip from computer running node
dns.lookup(os.hostname(), function (err, ip) {
  clientIp = ip;
});

// enpoint that sends ip to client
app.get('/clientIp', function(req, res) {
  res.status(200).send(clientIp);
});

// START IPERF SERVER ENDPOINT
app.post('/startServer', function(req, res) {

  // stores credentials for later use
  username = req.body.username;
  password = req.body.password;
  serverIp = req.body.serverIp;

  // sends iperf command to iperf server input by user
  var connection_options = { port: 22, username: username, password: password };
  rexec(serverIp, 'iperf3 -s', connection_options);

  // turn on socket.io to emit tcp
  switchedOn = true;
});

// STOP IPERF SERVER ENDPOINT
app.post('/stopServer', function(req, res) {
  terminate = true; // allows rexec call to terminate iperf during socket.io interval
  switchedOn = false; // turns off socket.io to stop tcp emission
});

// GET HISTORY ENDPOINT
app.get('/getHistory', function(req, res) {
  var history = { upstream: [], downstream: []};

  // get all info stored in upstream and downstream documents
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    cursor = db.collection('upstream').find();
    cursor2 = db.collection('downstream').find();

    // loop through upstream items
    cursor.each(function(err, up) {

      // when finished with upstream items
      if (!up) {

        // loop through downstream items
        cursor2.each(function(err, down) {

          // when finished with downstream items, send history to client
          if (!down) {
            res.status(200).send(history);
            db.close();
          } else { // add downstream item to history
            if (down.mbps) {
              history.downstream.push(down);
            }
          }

        });

      } else { // add upstream item to history
        if (up.mbps) {
          history.upstream.push(up);
        }
      }

    }); // end of cursor.each

  }); // end of MongoClient.connect

}); // end of get history endpoint

/* SERVER */
app.listen(port, function() {
  console.log('port ' + port + ' is listening');
});
