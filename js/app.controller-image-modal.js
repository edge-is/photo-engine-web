
/**
 * Controller for image Modal
 */
function imageModalController($scope, $location, $modalInstance, data, hotkeys, $rootScope, osm) {
    setTimeout(function (){
      $rootScope.modalOpen = true;
    }, 300);
    $scope.index = data.index;
    $scope.images = data.results
    $scope.image = parseImage(data.image);
    $scope.isFullscreen = false;
    $scope.fullscreenClass="no-fullscreen";

    $scope.lastURI = data.lastURI;
    $scope.currentLocation = $location.$$url;
    $scope.close = function () {
      $modalInstance.close();
    };

    $scope.dismiss = function () {
      $modalInstance.dismiss();
    };

    $rootScope.$on('historyBack', function (event, back){
      console.log('Hey!, back?', event, back, $scope.index);

      //$scope.prev();
    });

    function mustBeArray(arr){
      if (Array.isArray(arr)) return arr;
      return [arr];
    }

    $scope.nextImg = $scope.images[$scope.index + 1];
    $scope.prevImg = $scope.images[$scope.index - 1];

    $scope.next = function (){
      if(($scope.index + 1) < $scope.images.length ){
        $scope.StopLazy();
        $scope.index = $scope.index + 1;

        var img = $scope.images[$scope.index];
        $scope.image = parseImage(img);
        $scope.nextImg = $scope.images[$scope.index];
        $scope.prevImg = $scope.images[$scope.index - 1];

        $location.url('image.html?image=' + $scope.image._id );
      }
    };

    $scope.prev = function (){
      if($scope.index > 0){
        $scope.StopLazy();
        $scope.index = $scope.index - 1;
        var img = $scope.images[$scope.index];
        $scope.image = parseImage(img);
        $scope.prevImg = $scope.images[$scope.index];
        $location.url('image.html?image=' + $scope.image._id );
      }
    };

    function parseImage(img){
      img._source.Keywords = mustBeArray(img._source.Keywords);
      img._source.Subject = mustBeArray(img._source.Subject);
      return img;
    }



    $scope.nextURL = function (){
      if( $scope.nextImg ){
        return '/image.html?image=' + $scope.nextImg._id;
      }
    };

    $scope.prevURL = function (){
      if($scope.prevImg){
        return '/image.html?image=' + $scope.prevImg._id;
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

      $scope.$apply();
    };

    function exitHandler(event){
      if (
           document.webkitIsFullScreen === false
        || document.mozFullScreen === false
        || document.msFullscreenElement === null ) {
          $scope.isFullscreen = false;
          $scope.fullscreenClass = 'no-fullscreen';
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
      osm.search($scope.image._source, function (d){
        console.log(d);
        // map.osm(osmParams).then(function (d){
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
        // });
      })
    }
}
