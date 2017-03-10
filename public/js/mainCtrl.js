angular.module('throughput').controller('mainCtrl', function($scope, mainSvc, socket) {

  // scope/variables
  $scope.results = [null, null, null, null, null, null, null, null, null, null, null, null, null];
  $scope.resultsReverse = [null, null, null, null, null, null, null, null, null, null, null, null, null];
  $scope.resultsHistory = [null, null, null, null, null, null, null, null, null, null, null, null, null];
  $scope.serverIp = null;
  $scope.monthVal = 'mm', $scope.dayVal = 'dd', $scope.yearVal = 'yyyy';
  $scope.hourVal = 'hh', $scope.minuteVal = 'mm', $scope.secondVal = 'ss';
  $scope.days = ['dd'], $scope.months = ['mm'], $scope.years = ['yyyy'];
  $scope.hours = ['hh'], $scope.minutes = ['mm'], $scope.seconds = ['ss'];
  var histUp = [], histDown = [], hist = [];

  getClientIp(); // get client ip on load
  // retrieves client ip from user computer
  function getClientIp() {
    mainSvc.getClientIp().then(function(ip) {
      $scope.clientIp = ip;
    });
  }

  // manages visibility of auth form
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

  // starts iperf server
  $scope.start = function(clientIp, serverIp, username, password) {
    $('.auth').css('opacity', '0'); // hides auth form when started
    mainSvc.startServer(clientIp, serverIp, username, password);
  }

  // stops iperf server
  $scope.stop = function(clientIp, serverIp, username, password) {
    mainSvc.stopServer(clientIp, serverIp, username, password);
  };

  // socket recieves tcp data every 1.5 seconds
  // adds data to results displayed in graphs
  socket.on('tcp', function(data) {
    $scope.results.shift();
    $scope.results.push(Number(data[0]).toFixed(1));
    $scope.resultsReverse.shift();
    $scope.resultsReverse.push(Number(data[1]).toFixed(1));
  });

  // finds history opon selection
  $scope.findHistory = function() {
    var checkMonth, checkDay, checkYear, checkHour, checkMinute, checkSecond, date, count = 0, begin = false;

    // loops through history (either upstream or downstream depending on user selection)
    hist.forEach(function(tuple, i) {

      // turn date into checkable values
      date = new Date(tuple.date);
      checkMonth = date.getMonth(); checkMonth++;
      checkDay = date.getDate();
      checkYear = date.getFullYear();
      checkHour = date.getHours();
      checkMinute = date.getMinutes();
      checkSecond = date.getSeconds();

      // check all values until a match is found
      if (!begin) {
        if (Number($scope.monthVal) === checkMonth || $scope.monthVal === 'mm') {
          if (Number($scope.dayVal) === checkDay || $scope.dayVal === 'dd') {
            if (Number($scope.yearVal) === checkYear || $scope.yearVal === 'yyyy') {
              if (Number($scope.hourVal) === checkHour || $scope.hourVal === 'hh') {
                if (Number($scope.minuteVal) === checkMinute || $scope.minuteVal === 'mm') {
                  if (Number($scope.secondVal) === checkSecond || $scope.secondVal === 'ss') {
                    begin = true; //if date gets through each check, start saving historical data
                  }
                }
              }
            }
          }
        }
      } else if (count < 13) { //there are only 13 bars in graph
        $scope.resultsHistory.shift();
        $scope.resultsHistory.push(Number(tuple.mbps).toFixed(1));
        count++;
      }

    }); // end of hist.forEach

  }

  // toggles upstream/downstream history
  $scope.arrow = '↑';
  $scope.switchHist = function(val) {
    if (val === '↑') {
      hist = histUp;
    } else {
      hist = histDown;
    }
    $scope.findHistory();
  }

  getHistory(); // gets history on load
  // retrieves history from mongodb
  function getHistory() {
    mainSvc.getHistory().then(function(history) {

      // save info seperately for later use
      histUp = history.upstream;
      histDown = history.downstream;

      // loop through both upstream and downstream data
      for (var j = 0; j < 2; j++) {
        if (j === 0) { hist = histDown; }
        else { hist = histUp; }

        // parse history (either up/down) into months/days/etc... to be stored as select options
        hist.forEach(function(tuple, i) {

          // turn date into checkable values
          var date = new Date(tuple.date);
          var month = date.getMonth(); month++;
          var day = date.getDate();
          var year = date.getFullYear();
          var hour = date.getHours();
          var minute = date.getMinutes();
          var second = date.getSeconds();

          // if checkable value doesn't exist already, add to list of options
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

          // output last session for display purposes
          if (hist.length - i <= 13) {
            $scope.resultsHistory.shift();
            $scope.resultsHistory.push(Number(tuple.mbps).toFixed(1));
          }

        }); // end of hist.forEach

      } // end of for loop

    }); // end of mainSvc

  } // end of getHistory

});
