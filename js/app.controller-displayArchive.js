

function controllerDisplayArchive($scope, elasticsearch, $location, $timeout, $rootScope){

  $scope.images = [];
  var uriFilters = $location.search().filter;

  $scope.filters = [];

  if (uriFilters.indexOf('BASE64') > -1){
    $scope.filters = decodeURIfilter(uriFilters);
  }

  function decodeURIfilter(string){
    var decoded =  Base64.decode(
      string.split(':').pop()
    );
    try {
      return JSON.parse(decoded);
    } catch (e) {
      return decoded;
    }
  }


  function createURIfilter(arr){
    return {
      filter : ['BASE64', Base64.encodeURI(angular.toJson(arr))].join(':')
    };
  };


  var _i = $location.search().index;

  $scope.index = int(_i);
  $scope.offset = 0;
  $scope.limit = 30;
  $scope.total = 0;

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
  };

  $scope.back = function (index){

    var arr = $scope.filters.slice(0, index + 1);

    var uri = createURIfilter(arr);
    return window.location = '/webarchive.html?filter=' +uri.filter;
  }


  $scope.getImages = function (callback){
    callback = callback || function (){};

    var limit = $scope.limit;

    if (init && $scope.index){
      limit = $scope.index + 3;
    }

    if (isNaN(limit)){
      limit = 0;
    }


    var query = bodybuilder();

    $scope.filters.forEach(function (filter){
      query.filter(filter.type, filter.field, filter.value);
    });

    query.sort('filename', 'asc');

    elasticsearch.search({
      index : config.archive.index,
      type : config.archive.type,
      size : limit,
      from : $scope.offset,
      body : query
    }, function (err, res){
      if (err) return console.log(err);

      $scope.total = res.hits.total;

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

    $scope.index = index;
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
}
