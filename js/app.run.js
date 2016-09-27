
 function applicationRun($rootScope, $location) {
  var allowModalsInControllers = ['imageLinked'];

  $rootScope.history = [];

  $rootScope.oldPath = $location.$$path;
  $rootScope.$on('$locationChangeStart', function (event, data){
    $rootScope.oldPath = $location.$$path;
  });

  $rootScope.$on('$locationChangeSuccess', function(e, data) {
    var newPath = $location.$$path;

    var back = fromHistory(data);
    if (back){
      $rootScope.$emit('historyBack', back);
    }

    var myLastLocation = $rootScope.history[$rootScope.history.length -1];

    console.log($rootScope.modalOpen, newPath, myLastLocation);
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
      var found = false;
      var last = $rootScope.history[$rootScope.history.length - 2 ];
      if (!last) return false;
      if (last.absUrl === absURL) return last;
      return false;
    }

  });
}
