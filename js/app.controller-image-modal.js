

search.controller('imageModalController', [
  '$scope',
  '$location',
  '$modalInstance',
  'data',
  'map',
  'hotkeys',
  '$rootScope',
  function ($scope, $location, $modalInstance, data, map, hotkeys, $rootScope) {
    $scope.index = data.index;
    $scope.images = data.results
    $scope.image = data.image;
    $scope.isFullscreen = false;
    $scope.fullscreenClass="no-fullscreen";
    $scope.root = data.root;

    $scope.currentLocation = $location.$$url;
    // console.log($location)
    $scope.close = function () {
      $modalInstance.close();
    };

    $scope.dismiss = function () {
      $modalInstance.dismiss();
    };

    $scope.nextImg = $scope.images[$scope.index + 1];
    $scope.prevImg = $scope.images[$scope.index - 1];

    $scope.next = function (){
      if(($scope.index + 1) < $scope.images.length ){
        $scope.StopLazy();
        $scope.index = $scope.index + 1;
        $scope.image = $scope.images[$scope.index];
        $scope.nextImg = $scope.images[$scope.index];
      }
    };

    $scope.prev = function (){
      if($scope.index > 0){
        $scope.StopLazy();
        $scope.index = $scope.index - 1;
        $scope.image = $scope.images[$scope.index];
        $scope.prevImg = $scope.images[$scope.index];
      }
    };

    $scope.nextURL = function (){
      if( $scope.nextImg ){
        return '#/image/' + $scope.nextImg._id;
      }
    };

    $scope.prevURL = function (){
      if($scope.prevImg){
        return '#/image/' + $scope.prevImg._id;
      }
    };

    $scope.isNext = function (){
      var len = $scope.images.length;
      if(($scope.index + 1) >= len) {
        return false;
      }else{
        return true;
      }
    };

    $scope.isPrev = function (){
      if($scope.index == 0) {
        return false;
      }else{
        return true;
      }
    };

    $scope.landscape = function (img){
      if(img._source.ImageWidth < img._source.ImageHeight){
        return false;
      }else{
        return true;
      }
    };

    $rootScope.$on('$locationChangeStart', function (event, data){
      console.log(event, data);
    })

    $scope.StopLazy = function (){
      $('.high-resolution-image').unbind('load');
    };

    var fullscreens = 'webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange';

    $(document).on(fullscreens, exitHandler);

    $scope.fullscreen = function (){
      var i = document.getElementById("preview_carousel");
      if (i.requestFullscreen) {
      	i.requestFullscreen();
        //listenForFullScreenChange();
      } else if (i.webkitRequestFullscreen) {
      	i.webkitRequestFullscreen();
        //listenForFullScreenChange();
      } else if (i.mozRequestFullScreen) {
      	i.mozRequestFullScreen();
        //listenForFullScreenChange();
      } else if (i.msRequestFullscreen) {
      	i.msRequestFullscreen();
        //listenForFullScreenChange();
      }
      $scope.fullscreenClass = 'fullscreen';
      $scope.isFullscreen = true;

      // $scope.$apply();
    };

    function exitHandler(event){
      if (
           document.webkitIsFullScreen === false
        || document.mozFullScreen === false
        || document.msFullscreenElement === null ) {
          $scope.isFullscreen = false;
          $scope.fullscreenClass = 'no-fullscreen';
          console.log('EXIT?')
        }
    }


  hotkeys.bindTo($scope)
    .add({
      combo: 'right',
      description: 'Select next image.',
      callback: function() {
        $scope.next();
      }
    })
    .add({
      combo: 'left',
      description: 'Select prev image',
      callback: function() {
        $scope.prev();
      }
    })

    $scope.center = {};

    $scope.defaults = { scrollWheelZoom: false };
    $scope.mapmarker = {};

    $scope.Map = function (){
      $scope.MapLoaded = false;
      var osmParams = {};
      var SearchOSM=false;
      if ('City' in $scope.image._source){
        SearchOSM=true;
        osmParams.city = $scope.image._source.City;
      }else if('State' in $scope.image._source){
        SearchOSM=true;
        osmParams.state = $scope.image._source.State;
      }
      if('Country' in $scope.image._source){
        if($scope.image._source.Country.split(' ').length <= 2){
          osmParams.Country = $scope.image._source.Country;
        }
      }

      /** FIXME: Move to special controller **/
      if(SearchOSM == true){
        map.osm(osmParams).then(function (d){
          if(d.length > 0){
            $scope.MapLoaded = true;
            //angular.extend($scope, )
            $scope.center = {
              lat : +d[0].lat,
              lng : +d[0].lon,
              zoom : 4
            };
            $scope.mapmarker = {
              m1 : {
                lat : +d[0].lat,
                lng : +d[0].lon,
                message : 'Wazzuuup?',
                icon: 'img/map-marker.png'
              }
            };
          }
        });
      };
  }
}]);
