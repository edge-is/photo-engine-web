
 function applicationRun($rootScope, $location, $log) {
  var allowModalsInControllers = ['imageLinked'];

  $rootScope.history = [];

  $rootScope.oldPath = $location.$$path;
  $rootScope.$on('$locationChangeStart', function (event, data){
    $rootScope.oldPath = $location.$$path;
    $log.debug('$locationChangeStart', data, $rootScope.history);
  });

  $rootScope.$on('$locationChangeSuccess', function(e, data) {
    var newPath = $location.$$path;

    $log.debug('$locationChangeSuccess', data);

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

    $rootScope.history.push({
      url : $location.$$url,
      path : $location.$$path,
      absUrl : $location.$$absUrl,
      params : $location.search()
    });


    function fromHistory(absURL){
      if ($rootScope.history.length === 1) {
        return {
          url : $location.$$url,
          path : $location.$$path,
          absUrl : $location.$$absUrl,
          params : $location.search()
        }
      }

      var found = false;
      var last = $rootScope.history[$rootScope.history.length - 2 ];
      if (!last) return false;
      if (last.absUrl === absURL) return last;
      return false;
    }

  });
}
