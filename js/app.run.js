
 function applicationRun($rootScope, $location, $log) {
  var allowModalsInControllers = ['imageLinked'];

  $rootScope.history = [];

  $rootScope.oldPath = $location.$$path;
  $rootScope.$on('$locationChangeStart', function (event, data){
    $rootScope.oldPath = $location.$$path;
    $log.debug('RUN::$locationChangeStart', data, $rootScope.history);
  });

  function getLocationInfo(){
    return {
      url : $location.$$url,
      path : $location.$$path,
      absUrl : $location.$$absUrl,
      params : $location.search()
    };
  }
  function locationDiff(newLocation, oldLocation){
    var diff = compareObject(newLocation, oldLocation);
    var diffToSend = angular.copy(diff);

    console.log('Running diff', diffToSend);
    $rootScope.$emit('locationDiff', diffToSend);
  }

  function compareObject(newObject, oldObject){
    var diff = {};
    for (var key in newObject){
      var newValue = newObject[key];
      var oldValue = oldObject[key];

      if (typeof newValue === 'object'){
        diff[key] = compareObject(newValue, oldValue);
      }else if (newValue !== oldValue){
        diff[key] = {
          new : newValue,
          old : oldValue
        }
      }
    }
    return diff;
  }

  $rootScope.$on('$locationChangeSuccess', function(e, data) {
    var newPath = $location.$$path;


    var back = fromHistory(data);
    if (back){
      $rootScope.$emit('historyBack', back);
    }

    var myLastLocation = $rootScope.history[$rootScope.history.length -1];

    if ($rootScope.modalOpen){
      if (!myLastLocation) return;
      if (newPath !== myLastLocation.path){
        // close modal instance
        $rootScope.modalInstance.close();
      }
    }

    $rootScope.history.push(newLocation);
    function fromHistory(absURL){
      if ($rootScope.history.length === 1) {
        return getLocationInfo();
      }

      var found = false;
      var last = $rootScope.history[$rootScope.history.length - 2 ];
      if (!last) return false;
      if (last.absUrl === absURL) return last;
      return false;
    }

  });
}
