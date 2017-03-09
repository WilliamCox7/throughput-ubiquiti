angular.module('throughput').controller('mainCtrl', function($scope, mainSvc) {
  $scope.results = [null, null, null, null, null, null, null, null, null, null, null, null, null];
  $scope.resultsReverse = [null, null, null, null, null, null, null, null, null, null, null, null, null];
  $scope.serverIp = null;
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
  $scope.start = function() {
    $('.auth').css('opacity', '0');
  }
});
