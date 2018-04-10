

function controllerDisplayArchive($scope, elasticsearch, $location, $timeout, $rootScope, $uibModal, utils, cdn){

  $scope.showSearchBar = config.searchbar;
  $scope.images = [];
  $scope.thumbnails = [];

  $scope.loadingThumbnails = false;
  var uriFilters = $location.search().filter;

  $scope.filters = [];

  $scope.filters = utils.base64decode(uriFilters);

  var _i = $location.search().index;

  $scope.index = int(_i);
  $scope.offset = 0;
  $scope.limit = 30;
  $scope.total = 0;

  $scope.fileName = "image.jpg";

  $scope.loadingZoom = false;

  $scope.currenDoc = false;


  var init = true;

  function int(integer){
    var _int = parseInt(_int);

    if (isNaN(_int)){
      return 0;
    }

    return _int;
  }

  $scope.getFilters = function (){
    var _order = [
      'Source{{KEYWORD}}',
      'UserDefined4{{KEYWORD}}',
      ['UserDefined12{{KEYWORD}}', 'UserDefined14{{KEYWORD}}']
    ];

    //: FIXME: Þarf að laga þetta, hér vantar að joina filtera..



    return $scope.filters;
  }

  $scope.getImage = function (){
    var currentImage = getActiveImage();
    if (!currentImage) return "#";


    $scope.fileName = currentImage._source.ObjectName;
    return cdn.thumbnail(currentImage._source, 'xx-large');
  }

  $scope.print = function (){
    return window.print();
  }

  $scope.back = function (index){

    var arr = $scope.filters.slice(0, index + 1);
    var uri = {
      filter : utils.base64encode(angular.toJson(arr))
    };
    return window.location =  utils.createURI('webarchive.html', {
        index_id : $rootScope.currentIndexID,
        filter : uri.filter
    });
  };

  $scope.thumbnails = [];

  $scope.loadAllThumbnails = function (callback){

    var oldLimit = $scope.limit;

    $scope.limit = 1000;

    var query = $scope.createQuery();

    $scope.fetch(query, 0, 1000, callback)
  };
  $scope.showThumbnails = function (currentImages){
    $scope.loadingThumbnails = true;
    $scope.loadAllThumbnails(function (err, res){
      $scope.loadingThumbnails = false;

      var errorMessage = false;
      if (err) {
        console.error('Error loading images', err);
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

  $scope.zooming=false;

  $scope.zoom = function (){
    var element = $('.zoom.active');


    var controls = $('.carousel-control')
    if ($scope.zooming){
      controls.removeClass('hidden');
      element.removeClass('zoomable').trigger('zoom.destroy');
      return $scope.zooming = false;
    }

    $scope.loadingZoom = true;
    element.addClass('zoomable');
    controls.addClass('hidden');


    var currentImage = getActiveImage();
    var zoomSettings = {
      callback : function (){
        $scope.loadingZoom = false;
        $scope.$apply();
      }
    };


    if (currentImage._source){
      zoomSettings.url = cdn.thumbnail(currentImage._source, 'xx-large');
    }

    element.zoom(zoomSettings);

    $scope.zooming = true;
  }

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

      $scope.offset += res.hits.hits.length;

      if (res.hits.total < $scope.offset) return console.log('STOP');
      init = false;
      callback(null, res);
    });
  }

  $scope.createQuery = function (){
    var query = bodybuilder();
    $scope.filters.forEach(function (filter){
      query.filter(filter.type, filter.field, filter.value);
    });

    var field = $rootScope.currentIndex.sort.default.field || 'ObjectName';
    var type = $rootScope.currentIndex.sort.default.type || 'asc';
    query.sort(field, type);
    return query;
  }

  $scope.fetch = function (query, offset, limit, callback){
    elasticsearch.search({
      index : $rootScope.currentIndex.index.index,
      type : $rootScope.currentIndex.index.type,
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

    if ( ( i + 5 ) > $scope.images.length ){
      $scope.getImages();

    }

  });


  function getActiveImage(){
    return $scope.images.filter(function (image, i){
      return (image.__active)
    }).pop();
  }

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
