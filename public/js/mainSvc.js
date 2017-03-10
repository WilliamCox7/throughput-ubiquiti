angular.module('throughput').service('mainSvc', function($http) {

  /* GETS IP FROM USER COMPUTER */
  this.getClientIp = function() {
    return $http({
      method: 'GET',
      url: '/clientIp'
    }).then(function(ip) {
      return ip.data;
    });
  }

  /* STARTS IPERF SERVER */
  this.startServer = function(clientIp, serverIp, username, password) {
    $http({
      method: 'POST',
      url: '/startServer',
      data: {clientIp: clientIp, serverIp: serverIp, username: username, password: password}
    });
  }

  /* STOPS IPERF SERVER */
  this.stopServer = function(clientIp, serverIp, username, password) {
    $http({
      method: 'POST',
      url: '/stopServer',
      data: {clientIp: clientIp, serverIp: serverIp, username: username, password: password}
    });
  }

  /* GETS TCP HISTORY */
  this.getHistory = function() {
    return $http({
      method: 'GET',
      url: '/getHistory'
    }).then(function(history) {
      return history.data;
    });
  }

});
