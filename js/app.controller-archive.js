search.controller('archive', [ '$scope', '$route', '$http', 'imageCache', '$window', '$timeout', '$location', 'utils',  controllerArchive]);


function controllerArchive($scope, $route, $http, imageCache, $window, $timeout, $location, utils){

  var archive_id = $route.current.params.archiveID;


  $scope.limit = 30;
  $scope.offset= 0;
  $scope.DefaultImage = 'small';
  $scope.archiveImages=[];
  $scope.scrollDisabled = true;
  $scope.loadedImages = 0;
  $scope.filters = {};
  $scope.queryString = "";
  $scope.showSidebar = true;
  $scope.displayResultCount = false;
  $scope.navSearch = "";

  $scope.archive = "";

  $scope.root = $window.location.hash.replace(/\#/g, '');

  // Set initial filter
  $scope.filters.archive_id = archive_id;
  $scope.searchTime = 0;


  var thisArchiveAggregateInfo = utils.createURI([ config.api, '/aggregates/archive'].join(''), {
    filter : 'archive_id:' + archive_id
  });
  // "http://localhost:3000/api/aggregates/archive?filter=archive_id:68b2ae89e6dc2807aec8008e20ba132c";

  $http.get(thisArchiveAggregateInfo).then(function (response){
    var results = response.data.data.results;

    if (results.length > 0){

      $scope.archive = results[0].name ;
    }
  });


  $scope.requestQuery = function (limit, offset, newSearch, callback){

    callback = callback || function (){};

    var filterStringArray = [];
    $scope.filterString = (function (filters){
      var arr = [];
      var string = "";

      for (var key in filters){
        var value = filters[key];
        arr.push([ key, value].join(':'));

      }

      string += arr.join(',');
      return string;
    })($scope.filters);


    $scope.filterString+=filterStringArray.join(',');


    if (!$scope.queryString){
      $scope.queryString = "";
    }

    if ($scope.queryString.length > 1){

      $location.search('query', $scope.queryString);
    }
    if ($scope.filters.length > 1){
      var uriFilter = angular.copy($scope.filters);
      delete uriFilter.archive_id;

      $location.search('filter', uriFilter);
    }

    var arciveAPI = [config.api, '/search/query?'].join('');

     var uri = utils.createURI(arciveAPI, {
       limit : limit,
       offset : offset,
       query : $scope.queryString,
       filter : $scope.filterString
     });


    $scope.scrollDisabled = true;

    $http.get(uri).then(function (response){
      if (newSearch){
        $scope.archiveImages=[];
      }

      $scope.displayResultCount = true;

      $scope.searchTime = response.data.data._took;
      response.data.data.hits.forEach(function (hit){
        $scope.archiveImages.push(hit);
      });

      $scope.loadedImages = $scope.archiveImages.length;
      $scope.availableImagesCount = response.data.data._total;

      if ($scope.loadedImages <= $scope.availableImagesCount ){
        $scope.scrollDisabled = false;
      }

    }, callback);
  }

  $scope.photographersapi = [config.api, '/aggregates/Credit'].join('');


  $scope.searchDelay = 300;

  $scope.searching = false;


  $scope.addToFilter = function (key, value){

    if ($scope.filters[key] === value){
      delete $scope.filters[key];
    }else if (!$scope.filters[key]){
      $scope.filters[key] = value;
    }else{
      delete $scope.filters[key];
      $scope.filters[key] = value;
    }
    $scope.requestQuery($scope.limit, 0, true);
  }
  $scope.submitNavSearch = function (){
    $scope.queryString = $scope.navSearch;
    $scope.requestQuery($scope.limit, 0, true);
  }

  $scope.setImagesInCache = function (index, image){
    imageCache.images = $scope.archiveImages;
    imageCache.image = image;
    imageCache.index = index;
  }

  $scope.load_more_data = function (callback){
    $scope.requestQuery($scope.limit, $scope.loadedImages, false, callback);
  }

  var url_query_string = $location.search().query;

  if (typeof url_query_string === 'string'){
    $scope.queryString = url_query_string;
    $scope.navSearch = url_query_string;
  }

  $scope.requestQuery($scope.limit, 0, false);


}
