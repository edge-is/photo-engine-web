



function imageController($scope, $location, photoApi, cacheFactory, $rootScope, osm){
  var myLocation = $location.$$absUrl;
  $rootScope.$on('$locationChangeSuccess', function (event, newLocation){
    // console.log('i should go back now....', event, { DATA: newLocation, oldURI: myLocation}, $window);

    if (newLocation !== myLocation){
      window.location.reload();
    }
  });

  $scope.imageID = $location.search().image;

  $scope.cacheKey = $location.search().cache;


  $scope.image = {};

  photoApi.getByID($scope.imageID).success(function ( response){
    $scope.image = response.data;

    $scope.initMap();
  });

  $scope.center = {};

  $scope.defaults = { scrollWheelZoom: false };
  $scope.mapmarker = {};
  $scope.initMap = function (image){
    $scope.MapLoaded = false;
    osm.search($scope.image._source, function (d){
      if (d.lenght === 0) return;

      var location = d.pop();
      $scope.MapLoaded = true;
      //angular.extend($scope, )
      $scope.center = {
        lat : +location.lat,
        lng : +location.lon,
        zoom : 4
      };
      $scope.mapmarker = {
        m1 : {
          lat : +location.lat,
          lng : +location.lon,
          message : ':)',
          icon: 'img/map-marker.png'
        }
      };

      // });
    })
  }

}
