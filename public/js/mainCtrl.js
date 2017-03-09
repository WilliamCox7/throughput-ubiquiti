angular.module('throughput').controller('mainCtrl', function($scope, mainSvc, socket) {
  $scope.results = [null, null, null, null, null, null, null, null, null, null, null, null, null];
  $scope.resultsReverse = [null, null, null, null, null, null, null, null, null, null, null, null, null];
  $scope.serverIp = null;
  $scope.serverMessage = 'Server is Disconnected...';
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
    $scope.serverMessage = 'Starting Server...'
    mainSvc.startServer(clientIp, serverIp, username, password).then(function(result) {
      $scope.serverMessage = result;
    });
  }

  socket.on('tcp', function(data) {
    $scope.results.shift();
    $scope.results.push(Number(data).toFixed(1));
    $scope.serverMessage = 'Server Connected!';
  });

});
