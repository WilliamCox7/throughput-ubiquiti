angular.module('throughput').controller('mainCtrl', function($scope, mainSvc, socket) {
  $scope.results = [null, null, null, null, null, null, null, null, null, null, null, null, null];
  $scope.resultsReverse = [null, null, null, null, null, null, null, null, null, null, null, null, null];
  $scope.serverIp = null;
  $scope.serverMessage = 'Server is disconnected...';
  function getClientIp() {
    mainSvc.getClientIp().then(function(ip) {
      $scope.clientIp = ip;
    });
  }
  getClientIp();
  $scope.auth = function(serverIp) {
    var rx = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/;
    if (rx.test(serverIp)) {
      $('.auth').css('opacity', '1');
      $('.auth').css('background', 'slategray');
      $('.corner').css('background', 'slategray');
      $('.auth input').css('border-color', 'slategray');
    } else {
      $('.auth').css('background', '#b34141');
      $('.corner').css('background', '#b34141');
      $('.auth input').css('border-color', '#b34141');
    }
  }
  $scope.start = function(clientIp, serverIp, username, password) {
    $('.auth').css('opacity', '0');
    mainSvc.startServer(clientIp, serverIp, username, password).then(function(result) {
      $scope.serverMessage = result;
    });
  }

  socket.on('tcp', function(data) {
    $scope.results.shift();
    $scope.results.push(Number(data[0]).toFixed(1));
    $scope.resultsReverse.shift();
    $scope.resultsReverse.push(Number(data[1]).toFixed(1));
    if ($scope.serverMessage !== 'Server Connected!' && $scope.serverMessage !== 'Server Disconnected...') {
      $scope.serverMessage = 'Server Connected!';
    }
  });

  $scope.stop = function(clientIp, serverIp, username, password) {
    mainSvc.stopServer(clientIp, serverIp, username, password).then(function(result) {
      $scope.serverMessage = result;
    });
  };

  $scope.resultsHistory = [null, null, null, null, null, null, null, null, null, null, null, null, null];
  function getHistory() {
    mainSvc.getHistory().then(function(history) {
      for (var i = history.length-1; i >= history.length-13; i--) {
        if (history[i]) {
          $scope.resultsHistory.shift();
          $scope.resultsHistory.push(Number(history[i][1]));
        }
      }
      $scope.historyMessage = 'Displaying last session...';
    });
  }
  getHistory();

});
