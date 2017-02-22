

function controllerDisplayArchive($scope, $http, $location, $timeout, $rootScope){

  $scope.images = [];
  $scope.archive = $location.search().archive;


  $scope.filter = $location.search().f;

  var _i = $location.search().index;

  $scope.index = parseInt(_i);
  $scope.offset = 0;
  $scope.limit = 30;

  var init = true;


  $scope.getImages = function (callback){
    callback = callback || function (){};

    var limit = $scope.limit;

    if (init){
      limit = $scope.index + 3;
    }

    var url = [
      config.api,
      '/es/midlunarverkefni2/archives/_search?size=',
      limit,
      '&from=',
      $scope.offset
    ].join('');

    $http({
      url : url,
      data : bodybuilder()
              .filter('term', 'ReferenceNumber.raw', $scope.archive)
              .filter('term', 'UserDefined12.raw', $scope.filter)

              .sort('filename', 'asc')
              .build(),
      method : 'POST'
    }).then(function (res){

      var init = false;

      res.data.hits.hits.forEach(function (item){
        $scope.images.push(item);
      });

      $scope.offset += res.data.hits.hits.length;

      if (res.data.hits.total < $scope.offset) return console.log('STOP');


      callback();

    });
  }

  $(document).on('click','.carousel-control', function (){

    var i = findCurrentIndex();

    if ( (i + 5) > $scope.images.length){
      $scope.getImages();
    }

  });


  function findCurrentIndex(){
    var index = false;
    $scope.images.forEach(function (image, i){
      if (image.__active) {
        $location.search('index', i);
        index = i;
      }
    });

    return index;
  }

  $scope.getImages(function (){
    if ($scope.index > 0){
      $scope.images.forEach(function (image){
        image.__active = false;
      });

      $scope.images[$scope.index].__active = true;
    }
  });

  $rootScope.$on('historyBack', function (ev, data){

    console.log(data);
  });



}
