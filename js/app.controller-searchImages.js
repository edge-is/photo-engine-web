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
  createQuery){

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

  $scope.resultsLeft = false;

  $scope.URISearchDisabled = false;

  $scope.cachePhoto = config.cdn.cache;

  $scope.resultCount = 0;
  $scope.resultTime = 0;

  $scope.searchableFields = $rootScope.currentIndex.fields;


  $scope.hideAdvanceSearch = true;

  $scope.lastQuery = {};
  $scope.queryStringQuery = "";
  $scope.current_credit = $location.search().filter || false;

  $scope.URIQueryObject = false;

  $scope.imageDescriptionTooltip = "views/userdefined/image-description-tooltip.html";

  if ($rootScope.currentIndex.image && $rootScope.currentIndex.image.description){
    $scope.imageDescriptionTooltip = $rootScope.currentIndex.image.description;
  }


  $scope.toggleAdvancedSearch = function (){
    if ($scope.hideAdvanceSearch) return $scope.hideAdvanceSearch = false;
    $scope.hideAdvanceSearch = true;
  }

  $rootScope.$on('currentUriQueryChange', function (event, value){

    if ($scope.URISearchDisabled) return;

    $scope.URIQueryObject = value;

    var query = createQuery.create(value);

    $scope.queryStringQuery = createQuery.queryString(query.build(config.elasticsearch.version || 'v5'));



    if (!$scope.originalQuery) $scope.originalQuery = angular.copy(query);

    search({query: query, uriSearch:true });

  });

  $scope.removeThisFilter = function (){
    console.log('remove the main filter.. FACK!!')

    var f = $location.search().filter;

    console.log($scope.URIQueryObject, f);
    var index = $scope.URIQueryObject.filter.findIndex(function (item){

      if (item.value === f) return item;
    });
    if (index > -1){
      $scope.URIQueryObject.filter.splice(index, 1);
      return search({query : createQuery.create($scope.URIQueryObject) }, function (){
        var obj = angular.copy($scope.URIQueryObject);


        var base64Query = utils.base64encode(obj);
        $location.search('query', base64Query);

        $location.search('filter', null);

        $scope.current_credit = false;
      });
    }


  };

  $scope.queryStringSearch = function (){

    if ($scope.URIQueryObject.query){
      var index = $scope.URIQueryObject.query.findIndex(function (item){

        if (item.type === 'query_string') return item;
      });
      if (index > -1){
        $scope.URIQueryObject.query.splice(index, 1);
      }
    }else{
      $scope.URIQueryObject.query = [];
    }




    $scope.URIQueryObject.query.push({
      type: 'query_string', field: 'query', value : $scope.queryStringQuery
    });
    return search({query : createQuery.create($scope.URIQueryObject) }, function (){
      var obj = angular.copy($scope.URIQueryObject);

      var base64Query = utils.base64encode(obj);
      $location.search('query', base64Query);
    });
  }

  function setCurrentUri(){
    $scope.currentURI = $location.$$url;
  }
  $scope.onToggle = function (query){
    search({query : query});
  }

  function search(queryOptions, callback){
    callback = callback || function (){};


    var query = queryOptions.query;

    var append = queryOptions.append || false;

    var tmpQuery = queryOptions.query.build();
    console.log('QUERY ON ITS WAY', tmpQuery)

    if (tmpQuery.from){
      $location.search('from', tmpQuery.from);
    }

    query.size($scope.size);
    var elasticsearchQuery = {
      index : $scope.index,
      type : $scope.type,
      body : query
    }

    elasticsearch.search(elasticsearchQuery, function result(err, res){

      if (err) return $log.error(err, elasticsearchQuery);
      $scope.resultCount = res.hits.total;
      $scope.resultTime = res.took;
      $scope.lastResult = res;


      $scope.lastQuery = query;

      if (append){
        //$scope.result = $scope.result.concat(res.hits.hits);
        //
        res.hits.hits.forEach(function (hit){
          $scope.result.push(hit);
        })
      }else{
        $scope.result = res.hits.hits;
      }

      $scope.resultsLeft = (res.hits.total - $scope.result.length );

      if ($scope.result.length === res.hits.total){
        $scope.noMoreResults = true;
      }

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

    $scope.URISearchDisabled = true;

    search({query : query, append : true }, function done(){
      $scope.loadingMoreResults = false;
      $scope.URISearchDisabled = false;
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
    search({query : query});
  }


}
