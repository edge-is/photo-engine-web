

function controllerDisplayArchive($scope, elasticsearch, $location, $timeout, $rootScope, $uibModal){

  $scope.images = [];
  $scope.thumbnails = [];

  $scope.loadingThumbnails = false;
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
    return window.location = '/webarchive.html?filter=' + uri.filter;
  };

  $scope.thumbnails = [];

  $scope.loadAllThumbnails = function (callback){

    var oldLimit = $scope.limit;

    $scope.limit = 1000;

    /*$scope.getImages(function (err, res){
      $scope.limit = oldLimit;

      callback();

    })*/

    var query = $scope.createQuery();

    $scope.fetch(query, 0, 1000, callback)
  };
  $scope.showThumbnails = function (currentImages){
    $scope.loadingThumbnails = true;
    $scope.loadAllThumbnails(function (err, res){
      $scope.loadingThumbnails = false;

      var errorMessage = false;
      if (err) {
        console.log('Error loading images', err);
        errorMessage = {msg : 'Error loading images', err : err};
      }
      $scope.thumbnails = res.hits.hits;
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'views/thumbnails-modal.html',
        controller: 'thumbnailsModal',
        size: 'lg',
        resolve: {
          data: function () {
            return {
              error : errorMessage,
              images: $scope.thumbnails,
              getImages : $scope.getImages
            };
          }
        }
      });
      $rootScope.$emit('$modalOpen', modalInstance);
      modalInstance.result.then(function (selectedImage) {

        var image = selectedImage.image;
        var index = selectedImage.index;

        if (index > $scope.images.length){
          $scope.index = index;
          $scope.offset = $scope.thumbnails.length;
          $scope.images = $scope.setCarouselImageActiveByImageObject(
            $scope.thumbnails, selectedImage.image
          );
        }
        $scope.images = $scope.setCarouselImageActiveByImageObject(
          $scope.images, selectedImage.image
        );


      }, function () {
        //console.log('CLOSE 2')
      });
      $rootScope.modalInstance = modalInstance;
    });

  };
  function tmpFunction(arr){
    var q = $scope.createQuery();
    $scope.fetch(q, 0, 1000, function (err, res){
      var x = q.build();
      var j = JSON.stringify(x, null, 2)
      res.hits.hits.forEach(function (img){
        console.log(img._id, img._source.UserDefined12);
      });
      console.log('QUERY', j, res.hits.hits[10]);
    });

  }
  setTimeout(tmpFunction, 100)



  /**
   * Sets image based on image object active
   * @param {object} image image object
   */
  $scope.setCarouselImageActiveByImageObject = function (array, image){
    return array.map(function (img){
      if (image._id === img._id){
        img.__active = true;
      }else{
        img.__active = false;
      }
      return img;
    });
  };

  $scope.getImages = function (callback){
    callback = callback || function (){};

    var limit = $scope.limit;
    var offset = $scope.offset;

    if (init && $scope.index){
      limit = $scope.index + 3;
    }

    if (isNaN(limit)){
      limit = 0;
    }
    var query = $scope.createQuery();

    $scope.fetch(query, offset, limit, function (err, res){
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
      callback(null, res);
    })
  }

  $scope.createQuery = function (){
    var query = bodybuilder();
    $scope.filters.forEach(function (filter){
      query.filter(filter.type, filter.field, filter.value);
    });
    query.sort('filename', 'asc');
    return query;
  }

  $scope.fetch = function (query, offset, limit, callback){
    elasticsearch.search({
      index : config.archive.index,
      type : config.archive.type,
      size : limit,
      from : offset,
      body : query
    }, function (err, res){
      if (err) return callback(err);
      if (res.error) return callback(res);
      callback(null, res);
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
