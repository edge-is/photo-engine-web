

/**
 * Controller for static linking to images
 */
function imageController($scope, $location, photoApi, cacheFactory, $rootScope, osm, $window){
  var myLocation = $location.$$absUrl;
  $rootScope.$on('$locationChangeSuccess', function (event, newLocation){
    // console.log('i should go back now....', event, { DATA: newLocation, oldURI: myLocation}, $window);

    if (newLocation !== myLocation){
      window.location.reload();
    }
  });

  $scope.globalCopyright = config.copyright || '';

  $scope.onTypeaheadSubmit = function submitOnSearch(query){
    $window.location = '/search.html?query=' + query;
  };

  $scope.imageID = $location.search().image;

  $scope.cacheKey = $location.search().cache;


  $scope.image = {};

  photoApi.getByID($scope.imageID).success(function ( response){

    var img = response.data || {};
    img._source.Keywords = mustBeArray(img._source.Keywords);
    img._source.Subject = mustBeArray(img._source.Subject);
    $scope.image = img;


    $scope.initMap();
  });

  function mustBeArray(arr){
    if (Array.isArray(arr)) return arr;
    return [arr];
  }

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

    });
  }
}
