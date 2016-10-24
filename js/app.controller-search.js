
function mainSearchController($scope, photoApi, $location, $anchorScroll, $uibModal, $rootScope, utils, $timeout, $log){
  $scope.DefaultImage = "x-small";
  $scope.mainSearchHits =  [];
  $scope.mainSearchSize = 0;
  $scope.currentURI = $location.$$url;
  $scope.noResults = false;
  $scope.showSidebar = true;
  $scope.scrollDisabled = true;
  $scope.photographersapi =  [config.api, '/aggregates/Credit'].join('');

  $scope.enableURIwatch = true;
  // $scope.photographersapi =  [config.api, '/aggregates/Credit'].join('');

  $timeout(function (){
    $scope.scrollDisabled = false;
  }, 500);
  $scope.maxHits = 30;


  $scope.queryObject = {
    query : $scope.query,
    filter: false,
    limit : $scope.maxHits,
    offset : 0
  };

  $scope.onTypeaheadSubmit = function submitOnSearch(query){

    $scope.queryObject.query = query;

    $scope.prevResultsAvailable = false;
    $scope.queryObject.offset = 0;


    $scope.search($scope.queryObject, true);

  };

  $scope.largeInputSubmit = function (){
    $scope.query = $scope.queryObject.query;
    $scope.prevResultsAvailable = false;

    $scope.queryObject.offset = 0;
    $scope.search($scope.queryObject, true);
  }

  $scope.updateURI = function (queryObject){

    var qObject = angular.copy(queryObject);
    for (var key in qObject){
      if (!qObject[key]) delete qObject[key];

      if (typeof qObject[key] === 'object'){
        qObject[key] = JSON.stringify(qObject[key]);
      }
    }
    $location.search(qObject);
    $scope.currentURI = $location.$$url;
  };

  $scope.search = function (queryObject, newQuery, callback){
    $log.debug('SEARCH', queryObject, newQuery);
    if (newQuery){
      $scope.mainSearchHits =  [];
      $scope.queryObject = queryObject;
    }
    $scope.noResults = false;
    $scope.updateURI(queryObject);
    callback = callback || function (){};
    $scope.enableURIwatch = false;

    $log.debug('queryObject SEARCH', queryObject);
    photoApi.query(queryObject).then( function (response){
      $scope.displayResultCount = true;
      $scope.searchTime = response.data._took;
      $scope.submittedQuery = queryObject;

      $scope.lastResponse = response.data;

      if (response.data.hits.length === 0){
        $scope.noResults = true;
      }

      if (response.data._total < $scope.maxHits){
        $scope.noResults = true;
      }

      response.data.hits.forEach(function (item){
        $scope.mainSearchHits.push(item);
      });
      $scope.enableURIwatch = true;
      callback();
    });
  }

  $scope.updateViewPort = function (imageID){
    $scope.submittedQuery.anchor = imageID;
    $scope.updateURI($scope.submittedQuery);
  }

  function int(number){
    var i = parseInt(number);

    if (isNaN(i)) return false;

    return i;
  }

  $scope.load_more_data = function (callback){
    $log.debug('DEBUG: Loading more data');

    if ($scope.scrollDisabled) return $log.info('SET TO BE DISABLED; STOPPING');

    $scope.submittedQuery.offset = $scope.submittedQuery.offset || 0;

    var nextOffset = $scope.submittedQuery.offset + $scope.maxHits;


    if ($scope.lastResponse._total < $scope.maxHits){
      $scope.noResults = true;
      return $log.info('Stopping no more results');
    }

    $scope.scrollDisabled = true;

    $scope.submittedQuery.offset = nextOffset;

    $log.info('Load More Data object:', $scope.submittedQuery);
    $scope.search($scope.submittedQuery, false, function (){
      $scope.scrollDisabled = false;
      $timeout(callback, 500);
    });
  };

  $scope.$watchCollection('queryObject.query', function (_new, _old){
    $scope.query = _new;
  });

  $scope.openImage = function (index, image, images){
    var lastURI = "";
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'views/image-modal.html',
      controller: 'imageModalController',
      size: 'lg',
      resolve: {
        data: function () {
          return {
            lastURI: $scope.currentURI,
            index: index,
            image: image,
            results: images
          };
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
      $location.url($scope.currentURI);
      $rootScope.modalOpen = false;
    }, function () {
      $location.url($scope.currentURI);
      $rootScope.modalOpen = false;
   });

    $rootScope.modalInstance = modalInstance;
  };

  $scope.queryParams = $location.search() || {};

  $scope.queryParams.limit = int($scope.queryParams.limit) || false;
  $scope.queryParams.offset = int($scope.queryParams.offset) || false;

  $scope.queryParams.filter = utils.JSON.parse($scope.queryParams.filter);
  $scope.queryParams.query = $scope.queryParams.query || "";


  $scope.loadPrevResults = function (){
    $scope.queryParams.offset = 0;
    $scope.prevResultsAvailable = false;
    $scope.search($scope.queryParams, true, function (){
      var anchor = $scope.queryParams.anchor || false;
      if (anchor){
        $anchorScroll(anchor);
      }
    });
  }

  if ( $scope.queryParams.query || $scope.queryParams.filter){
    $scope.query = $scope.queryParams.query;
    if ($scope.queryParams.offset > 0 ) $scope.prevResultsAvailable = true;
    var anchor = $scope.queryParams.anchor || false;
    $log.debug('Searching from queryParams');
    $scope.search($scope.queryParams, true, function (){
      $log.debug('Loaded search from queryParams');
      if (anchor){
        $anchorScroll(anchor);
      }
    });
  }

  // $scope.$watchCollection('queryObject.filter', function (_new, _old){
  //   // Return if the value is the same
  //   // to prevent loading the data twice
  //   $log.debug('queryObject.filter', _new, _old);
  //   if (_new === _old) return;
  //   $log.debug('Searching from watchCollection(queryObject.fitler)', _new, _old)
  //   if (_new) {
  //     $scope.search($scope.queryObject, true);
  //   }
  // });

  $rootScope.$on('$locationChangeSuccess', function (event, data){
    if ($scope.enableURIwatch){
      var params = $location.search();
      $log.debug('Searching from changed query params', params);
      params.filter = utils.JSON.parse(params.filter);
      params.query = params.query || "";
      $scope.search(params, true);
    }

  });
  // $rootScope.$on('historyBack', function (event, data){
  //   $log.debug('historyBack', data);
  //
  //   // if query or filter then search for it.
  //   if (data.params.query || data.params.filter) $scope.search(data.params, true);
  // });


}
