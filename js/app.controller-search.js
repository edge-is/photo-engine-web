
function mainSearchController($scope, photoApi, $location, $anchorScroll, $uibModal, $rootScope, utils, $timeout, $log){
  $scope.DefaultImage = "x-small";
  $scope.mainSearchHits =  [];
  $scope.mainSearchSize = 0;
  $scope.currentURI = $location.$$url;
  $scope.noResults = false;
  $scope.showSidebar = true;
  $scope.scrollDisabled = true;
  $scope.maxHits = 30;

  $timeout(function (){
    $scope.scrollDisabled = false;
  }, 500);

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

    $log.debug('typeaheadSubmit', query);

    $scope.search($scope.queryObject, true);
  };

  $scope.largeInputSubmit = function (){
    $scope.query = $scope.queryObject.query;
    $scope.prevResultsAvailable = false;

    $scope.queryObject.offset = 0;
    $scope.search($scope.queryObject, true);
  }

  $scope.updateURI = function (queryObject){
    $log.debug('updateURI', queryObject);

    var qObject = angular.copy(queryObject);
    for (var key in qObject){
      if (!qObject[key]) delete qObject[key];

      if (typeof qObject[key] === 'object'){
        qObject[key] = JSON.stringify(qObject[key]);
      }
    }
    $rootScope.$emit('$updateURI', qObject);
    $location.search(qObject);
    $scope.currentURI = $location.$$url;
  };

  $scope.search = function (_queryObject, newQuery, callback){
    callback = callback || function (){};
    var queryObject = angular.copy(_queryObject);

    $log.debug('SEARCH', queryObject, newQuery);
    $rootScope.$emit('$search', queryObject, newQuery);

    if (newQuery){
      $scope.mainSearchHits =  [];
      $scope.queryObject = queryObject;
    }
    $scope.noResults = false;

    $scope.updateURI(queryObject);

    $log.debug('queryObject SEARCH', queryObject);
    photoApi.query(queryObject).then( function (response){

      $log.debug('search::results', response.data.hits.length, response.data._took);

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

      callback();
    });
  }

  $scope.updateViewPort = function (imageID){

    $rootScope.$emit('$anchor', imageID);
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
    $scope.enableURIwatch = false;
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
    $rootScope.$emit('$modalOpen', modalInstance);

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
      $scope.enableURIwatch = true;
      $location.url($scope.currentURI);
      $rootScope.modalOpen = false;
    }, function () {
      $location.url($scope.currentURI);
      $scope.enableURIwatch = true;
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

  $rootScope.$on('$filterChange', function (event, filters){
    $log.debug('filtersChange', filters, $scope.submittedQuery);
    var newSearchObject = angular.copy($scope.submittedQuery);

    newSearchObject.filter = filters;

    $scope.search(newSearchObject, true);

  });


}
