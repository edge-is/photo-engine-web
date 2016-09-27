
function mainSearchController($scope, photoApi, $location, $anchorScroll, $uibModal, $rootScope, utils){
  $scope.DefaultImage = "x-small";
  $scope.searchResultsTotal = false;
  $scope.mainSearchHits =  [];
  $scope.mainSearchSize = 0;
  $scope.noResults = false;
  $scope.scrollDisabled = true;

  $scope.currentURI = $location.$$url;
  $scope.showSidebar = true;
  $scope.scrollDisabled = true;
  $scope.photographersapi =  [config.api, '/aggregates/Credit'].join('');
  setTimeout(function (){
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
    $scope.search($scope.queryObject, true);

  };

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
    console.log('SEARCH', queryObject);
    if (newQuery){
      $scope.mainSearchHits =  [];
      $scope.queryObject = queryObject;
    }
    $scope.updateURI(queryObject);
    callback = callback || function (){};

    photoApi.query(queryObject).then( function (response){
      $scope.displayResultCount = true;
      $scope.searchTime = response.data._took;
      $scope.searchResultsTotal = response.data._total;
      $scope.submittedQuery = queryObject;

      if (response.data.hits.length === 0){
        $scope.noResults = true;
      }

      response.data.hits.forEach(function (item){
        $scope.mainSearchHits.push(item);
      });

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
    console.log('LOAD MORE DATA');
    if ($scope.mainSearchHits.length < $scope.maxHits){
      return $scope.noResults = true;
    }

    if ($scope.scrollDisabled) return;

    var nextOffset = $scope.submittedQuery.offset + $scope.maxHits;
    if ($scope.searchResultsTotal > nextOffset ){
      $scope.submittedQuery.offset = nextOffset;
    }else{
      $scope.noResults = true;
      return $scope.scrollDisabled = true;
    }

    $scope.scrollDisabled = true;
    $scope.search($scope.submittedQuery, false, function (){
      $scope.scrollDisabled = false;
      setTimeout(callback, 500);
    });
  };

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
  $scope.queryParams.query = $scope.queryParams.query || false;


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

  if ( $scope.queryParams.query){
    $scope.query = $scope.queryParams.query;
    if ($scope.queryParams.offset > 0 ) $scope.prevResultsAvailable = true;
    var anchor = $scope.queryParams.anchor || false;
    $scope.search($scope.queryParams, true, function (){
      if (anchor){
        $anchorScroll(anchor);
      }
    });
  }

  if ($scope.queryParams.filter){
    $scope.search($scope.queryParams, true);
  }

  $scope.$watchCollection('queryObject.filter', function (_new, _old){
    if (_new) $scope.search($scope.queryObject, true);
  });


}
