angular.module('throughput').service('mainSvc', function($http) {
  this.getClientIp = function() {
    return $http({
      method: 'GET',
      url: '/clientIp'
    }).then(function(ip) {
      return ip.data;
    });
  }
});
