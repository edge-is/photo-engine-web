

function controllerDisplayArchive($scope, elasticsearch, $location, $timeout, $rootScope){

  $scope.images = [];
  $scope.archive = $location.search().archive;
  $scope.filter = $location.search().f;

  var _i = $location.search().index;

  $scope.index = parseInt(_i);
  $scope.offset = 0;
  $scope.limit = 30;

  $scope.currenDoc = false;

  $scope.dir = [];

  var init = true;

  function int(integer){
    var _int = parseInt(_int);

    if (isNaN(_int)){
      return 0;
    }

    return _int;
  }


  $scope.getDir = function (){
    var image = $scope.images[0];
    if (!image) return;
    var src = image._source;

    var ObjectName = $scope.currenDoc._source.ObjectName;
    $scope.dir = [ src.Source, src.UserDefined4, src.UserDefined12, ObjectName ];

    console.log($scope.dir);
  };




  $scope.getImages = function (callback){
    callback = callback || function (){};

    var limit = $scope.limit;

    if (init && $scope.index){
      limit = $scope.index + 3;
    }

    if (isNaN(limit)){
      limit = 0;
    }

    var query = bodybuilder()
            .filter('term', 'ReferenceNumber.raw', $scope.archive)
            .filter('term', 'UserDefined12.raw', $scope.filter)
            .sort('filename', 'asc')
            .build();

    elasticsearch.search({
      index : config.archive.index,
      type : config.archive.type,
      size : limit,
      from : $scope.offset,
      body : query
    }, function (err, res){
      if (err) return console.log(err);

      res.hits.hits.forEach(function (item){
        $scope.images.push(item);
      });

      if (init){
        $scope.currenDoc = $scope.images[0];
      }
      $scope.getDir();

      $scope.offset += res.hits.hits.length;

      if (res.hits.total < $scope.offset) return console.log('STOP');


      init = false;
      callback();
    });
  }

  $(document).on('click','.carousel-control', function (){

    var i = findCurrentIndex();

    if (!i) return;
    $scope.currenDoc = $scope.images[i];

    $scope.getDir();


    if ( ( i + 5 ) > $scope.images.length ){
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
