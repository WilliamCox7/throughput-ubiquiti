angular.module('throughput').controller('mainCtrl', function($scope, mainSvc, socket) {
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
  $scope.start = function(clientIp, serverIp, username, password) {
    $('.auth').css('opacity', '0');
    mainSvc.startServer(clientIp, serverIp, username, password).then(function(result) {
      console.log(result);
    });
  }

  socket.on('tcp', function(data) {
    $scope.results.shift();
    $scope.results.push(Number(data[0]).toFixed(1));
    $scope.resultsReverse.shift();
    $scope.resultsReverse.push(Number(data[1]).toFixed(1));
  });

  $scope.stop = function(clientIp, serverIp, username, password) {
    mainSvc.stopServer(clientIp, serverIp, username, password).then(function(result) {

    });
  };

  var histUp = [], histDown = [], hist = [];
  $scope.monthVal = 'mm';
  $scope.dayVal = 'dd';
  $scope.yearVal = 'yyyy';
  $scope.hourVal = 'hh';
  $scope.minuteVal = 'mm';
  $scope.secondVal = 'ss';
  $scope.findHistory = function() {
    var checkMonth, checkDay, checkYear, checkHour, checkMinute, checkSecond, date, count = 0, begin = false;
    hist.forEach(function(tuple, i) {

      date = new Date(tuple.date);
      checkMonth = date.getMonth(); checkMonth++;
      checkDay = date.getDate();
      checkYear = date.getFullYear();
      checkHour = date.getHours();
      checkMinute = date.getMinutes();
      checkSecond = date.getSeconds();

      if (!begin) {
        if (Number($scope.monthVal) === checkMonth || $scope.monthVal === 'mm') {
          if (Number($scope.dayVal) === checkDay || $scope.dayVal === 'dd') {
            if (Number($scope.yearVal) === checkYear || $scope.yearVal === 'yyyy') {
              if (Number($scope.hourVal) === checkHour || $scope.hourVal === 'hh') {
                if (Number($scope.minuteVal) === checkMinute || $scope.minuteVal === 'mm') {
                  if (Number($scope.secondVal) === checkSecond || $scope.secondVal === 'ss') {
                    begin = true;
                  }
                }
              }
            }
          }
        }
      } else if (count < 13) {
        $scope.resultsHistory.shift();
        $scope.resultsHistory.push(Number(tuple.mbps).toFixed(1));
        count++;
      }

    });
  }

  $scope.arrow = '↑';
  $scope.switchHist = function(val) {
    if (val === '↑') {
      hist = histUp;
    } else {
      hist = histDown;
    }
    $scope.findHistory();
  }

  $scope.resultsHistory = [null, null, null, null, null, null, null, null, null, null, null, null, null];
  $scope.days = ['dd'];
  $scope.months = ['mm'];
  $scope.years = ['yyyy'];
  $scope.hours = ['hh'];
  $scope.minutes = ['mm'];
  $scope.seconds = ['ss'];
  function getHistory() {
    mainSvc.getHistory().then(function(history) {
      histUp = history.upstream;
      histDown = history.downstream;
      for (var j = 0; j < 2; j++) {
        if (j === 0) { hist = histDown; }
        else { hist = histUp; }
        hist.forEach(function(tuple, i) {
          var date = new Date(tuple.date);
          var month = date.getMonth(); month++;
          var day = date.getDate();
          var year = date.getFullYear();
          var hour = date.getHours();
          var minute = date.getMinutes();
          var second = date.getSeconds();

          if ($scope.months.indexOf(month.toString()) == -1) {
            $scope.months.push(month.toString());
          }
          if ($scope.days.indexOf(day.toString()) == -1) {
            $scope.days.push(day.toString());
          }
          if ($scope.years.indexOf(year.toString()) == -1) {
            $scope.years.push(year.toString());
          }
          if ($scope.hours.indexOf(hour.toString()) == -1) {
            $scope.hours.push(hour.toString());
          }
          if ($scope.minutes.indexOf(minute.toString()) == -1) {
            $scope.minutes.push(minute.toString());
          }
          if ($scope.seconds.indexOf(second.toString()) == -1) {
            $scope.seconds.push(second.toString());
          }

          if (hist.length - i <= 13) {
            $scope.resultsHistory.shift();
            $scope.resultsHistory.push(Number(tuple.mbps).toFixed(1));
          }
        });
      }

    });
  }
  getHistory();

});
