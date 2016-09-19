
search.controller('mainSearch', ['$scope','_search', '$location', mainSearchController]);

function mainSearchController($scope, _search, $location ){
  $scope.DefaultImage = "x-small";
  console.log('Index controller');
  $scope.searchResultsTotal = false;
  $scope.mainSearchHits =  [];
  $scope.mainSearchSize = 0;

  $scope.scrollDisabled = true;

  $scope.mainSearchOptions = {
    limit : 30,
    offset : 0
  };





  $scope.onTypeaheadSubmit = function submitOnSearch(query){
    $scope.search(query);
  };

  $scope.search = function (query, filter){
    _search.query(query, $scope.mainSearchOptions).then( function (response){
      $scope.displayResultCount = true;
      $scope.searchTime = response.data._took;
      $scope.searchResultsTotal = response.data._total;
      $scope.mainSearchHits = response.data.hits;
      $scope.mainSearchSize = response.data.hits.length;
      $scope.submittedQuery = query;

      $scope.scrollDisabled = false;
    });
  }

  $scope.load_more_data = function (callback){
    console.log('Load more....');
    if ($scope.mainSearchSize < 1){
      return;
    }
    var options = {
      limit : $scope.mainSearchOptions.limit,
      offset : $scope.mainSearchSize
    };
    _search.query($scope.submittedQuery, options).then( function (response){
      if (!response) return;

      if (response.data.hits.length < 1){
        return;
      }
      $scope.searchTime = response.data._took;
      $scope.searchResultsTotal = response.data._total;

      // $scope.mainSearchHits.concat(response.data.hits);
      response.data.hits.forEach(function (item){
        $scope.mainSearchHits.push(item);
      });
      $scope.mainSearchSize += response.data.hits.length;
      callback();
    });
  };


  $scope.uriQuery = $location.search().query || false;
  $scope.uriFilter= $location.search().filter || false;
  console.log($scope, $location.search());
  if ($scope.uriQuery || $scope.uriFilter){
    $scope.search($scope.uriQuery, $scope.uriFilter);
  }


}
