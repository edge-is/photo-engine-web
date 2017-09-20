function controllerSearchImages(
  $scope,
  elasticsearch,
  $rootScope,
  $log,
  cdn,
  utils,
  $location,
  $uibModal,
  $window,
  loadElasticQuery){

  $scope.result = [];

  $scope.from = 0;
  $scope.size = 100;
  $scope.lastResult = false;
  $scope.currentURI = $location.$$url;

  $scope.noMoreResults = false;

  $scope.originalQuery = false;
  $scope.loadingMoreResults = false;

  $scope.index = $rootScope.currentIndex.index.index;
  $scope.type = $rootScope.currentIndex.index.type;
  $scope.index_id = $rootScope.currentIndexID;


  $scope.cachePhoto = config.cdn.cache;

  $scope.resultCount = 0;
  $scope.resultTime = 0;

  $scope.searchableFields = $rootScope.currentIndex.fields;


  $scope.hideAdvanceSearch = true;

  $scope.lastQuery = {};
  $scope.queryStringQuery = "";
  $scope.current_credit = $location.search().filter || false;

  $scope.imageDescriptionTooltip = $rootScope.currentIndex.image.description;

  $scope.toggleAdvancedSearch = function (){
    if ($scope.hideAdvanceSearch) return $scope.hideAdvanceSearch = false;
    $scope.hideAdvanceSearch = true;
  }
  $rootScope.$on('currentUriQueryChange', function (event, value){

    var query = loadElasticQuery.parse(value);

    console.log(
      'Loaded query', query.build()
    )

    $scope.queryStringQuery = loadElasticQuery.queryString(value);
    if (!$scope.originalQuery) $scope.originalQuery = angular.copy(query).build(config.elasticsearch.version || 'v5');

    search(query);

  });

  $scope.queryStringSearch = function (){

    // FIXME:: Dirty hack .. need to be able to clone the object.

    // Remove the current query_string ..
    if ($scope.originalQuery.query){
      if ($scope.originalQuery.query.bool.must){
        var arr = $scope.originalQuery.query.bool.must;
        if (Array.isArray(arr)){
          $scope.originalQuery.query.bool.must = arr.filter(function (item){
            var key = Object.keys(item).pop();
            return (key === 'query_string') ? false : true;
          });
        }
      }
    }

    var query = loadElasticQuery.parse($scope.originalQuery);
    query.query('query_string', 'query', $scope.queryStringQuery);

    search(query);
    query = null;
  }

  function first(obj){
    for (var key in obj) return key;
  }

  function extractElasticsearchFilter(esQuery){
    var field = first(esQuery);
    var value = esQuery[field];
    return {field : field, value : value};
  }

  function loadJsonQueryIntoBodybuilder(jsonObject){

    if (!jsonObject.query) return bodybuilder();

    if (jsonObject.query.bool.filter.term){

      var obj = extractElasticsearchFilter(jsonObject.query.bool.filter.term);
      return bodybuilder().filter('term', obj.field, obj.value);
    }

  };

  function setCurrentUri(){
    $scope.currentURI = $location.$$url;
  }
  $scope.onToggle = function (query){
    search(query);
  }

  function search(query, append, callback){
    console.log('Searching, es query:', query.build())
    callback = callback || function (){};

    append = append || false;
    query.size($scope.size);
    var elasticsearchQuery = {
      index : $scope.index,
      type : $scope.type,
      body : query
    }

    var querySent = angular.copy(query);

    elasticsearch.search(elasticsearchQuery, function result(err, res){

      if (err) return $log.error(err, elasticsearchQuery);
      $scope.resultCount = res.hits.total;
      $scope.resultTime = res.took;
      $scope.lastResult = res;

      $scope.lastQuery = query;

      if (append){
        $scope.result = $scope.result.concat(res.hits.hits);
      }else{
        $scope.result = res.hits.hits;
      }
      if ($scope.result.length === res.hits.total){
        $scope.noMoreResults = true;
      }

      var base64EncodedQuery = utils.base64encode(querySent.build($rootScope.config.elasticsearch.version || 'v5'));
      $location.search('query',  base64EncodedQuery);

      callback();
    });
    setCurrentUri();

  }

  $scope.displayImage = function (key, image, result){
    $scope.enableURIwatch = false;
    var lastURI = "";
    var modalInstance = $uibModal.open({
      animation: false,
      templateUrl: 'views/image-modal.html',
      controller: 'imageModalController',
      size: 'lg',
      resolve: {
        data: function () {
          return {
            lastURI: $scope.currentURI,
            index: key,
            image: image,
            results: result
          };
        }
      }
    });
    $rootScope.$emit('$modalOpen', modalInstance);

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
      $location.url($scope.currentURI);
      $rootScope.modalOpen = false;
    }, function () {
      $location.url($scope.currentURI);
      $rootScope.modalOpen = false;
    });
    $rootScope.modalInstance = modalInstance;
  }

  $scope.loadMoreResults = function (callback){
    var query = angular.copy($scope.lastQuery);

    query.from($scope.result.length);
    $scope.loadingMoreResults = true;

    search(query, true, function done(){
      $scope.loadingMoreResults = false;
    });



  }

  // Advanced search controller ....

  $scope.advancedSearchFields=[];

  $scope.advAdd = function (){
    $scope.advancedSearchFields.push({
      op : 'is',
      orAnd : 'AND'
    })
  }

  $scope.advSearch = function (){

    var query = bodybuilder();

    $scope.advancedSearchFields.forEach(function (item){
      if (item.orAnd === 'OR') return  query.orQuery('match', item.field, item.value);
      if(item.op === 'not') return query.notQuery('match', item.field, item.value );
      return query.query('match', item.field, item.value );

    });
    search(query);
  }


}
