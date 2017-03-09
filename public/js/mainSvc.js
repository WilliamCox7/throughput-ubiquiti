angular.module('throughput').service('mainSvc', function($http) {
  this.getClientIp = function() {
    return $http({
      method: 'GET',
      url: '/clientIp'
    }).then(function(ip) {
      return ip.data;
    });
  }
  this.startServer = function(clientIp, serverIp, username, password) {
    return $http({
      method: 'POST',
      url: '/startServer',
      data: {clientIp: clientIp, serverIp: serverIp, username: username, password: password}
    }).then(function(result) {
      return result.data;
    });
  }
});
