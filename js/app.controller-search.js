
search.controller('mainSearch', ['$scope','apiSearch', '$location', mainSearchController]);

function mainSearchController($scope, apiSearch, $location ){
  $scope.DefaultImage = "x-small";
  console.log('Index controller');
  $scope.searchResultsTotal = false;
  $scope.mainSearchHits =  [];
  $scope.mainSearchSize = 0;

  $scope.scrollDisabled = true;

  $scope.maxHits = 30;
  $scope.queryObject = {
    query : false,
    filter: false,
    limit : $scope.maxHits,
    offset : 0
  };



  $scope.onTypeaheadSubmit = function submitOnSearch(query){

    $scope.queryObject.query = query;

    $scope.search();
  };

  $scope.updateURI = function (){
    var url = {};
    if($scope.mainSearchQuery !== ''){
      url.query = $scope.mainSearchQuery;
    }
    if($scope.mainSearchFilter !== ''){
      url.filter = $scope.mainSearchFilter;
    }
    $location.search(url);
  };

  $scope.search = function (){


    apiSearch.query($scope.queryObject).then( function (response){
      $scope.displayResultCount = true;
      $scope.searchTime = response.data._took;
      $scope.searchResultsTotal = response.data._total;
      $scope.mainSearchHits = response.data.hits;
      $scope.mainSearchSize = response.data.hits.length;
      $scope.scrollDisabled = false;

      $scope.submittedQuery = $scope.queryObject;
    });
  }

  $scope.scrollDisabled = false;

  $scope.load_more_data = function (callback){
    if ($scope.mainSearchSize < 1){
      return;
    }

    if ($scope.scrollDisabled) return;

    $scope.scrollDisabled = true;

    $scope.submittedQuery.offset +=$scope.maxHits;

    apiSearch.query($scope.submittedQuery).then( function (response){
      if (!response) return;

      if (response.data.hits.length < 1){
        return;
      }
      $scope.searchTime = response.data._took;
      $scope.searchResultsTotal = response.data._total;

      response.data.hits.forEach(function (item){
        $scope.mainSearchHits.push(item);
      });

      $scope.mainSearchSize += response.data.hits.length;
      $scope.scrollDisabled = false;

      setTimeout(callback, 500);
    });
  };


  $scope.uriQuery = $location.search().query || false;
  $scope.uriFilter= $location.search().filter || false;
  if ($scope.uriQuery || $scope.uriFilter){
    $scope.search($scope.uriQuery, $scope.uriFilter);
  }


}
