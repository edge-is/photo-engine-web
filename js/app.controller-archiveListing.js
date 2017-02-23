/**
 * Controller for Archive Listing
 */

function archiveListingController($scope, elasticsearch, $rootScope, $location){
  var url = [config.api, '/aggregates/archive'].join('');
  $scope.items = [];

  $scope.images = [];

  $scope.onTypeaheadSubmit = function submitOnSearch(query){
    window.location = '/search.html?query=' + query;
  };

  $scope.query = "";
  $scope.queryObject = {};

  $scope.lastValue = "";

  $scope.dir = [];

  $scope.order = [
    { active:true,  field : "Source.raw" ,         filter : false },
    { active:false, field : "UserDefined4.raw" ,   filter : { field : "Source.raw", value : false } },
    { active:false, field : "UserDefined12.raw" ,  filter : { field : "UserDefined4.raw", value : false } },
    { active:false, field : "ReferenceNumber.raw", filter : { field : "UserDefined12.raw", value : false } }
  ];

  function setActive(field){
    $scope.order.forEach(function (item, key){
      $scope.order[key].active = false;

      if (item.field === field){
        $scope.order[key].active = true;
      }
    })
  };

  $scope.next = function (value, ord, oIndex){
    var _next = oIndex + 1;

    if (!$scope.order[_next]) {
      var location = '/displayarchive.html?f='+$scope.lastValue+'&archive=' + value;
      return window.location = location;
    };

    $scope.order[oIndex].active = false;
    $scope.order[_next].active = true;

    $scope.dir[oIndex] = $scope.order[_next];
    $scope.lastValue = value;

    $scope.order[_next].filter.value = value;
    get(
      $scope.order[_next].field,
      $scope.order[_next].filter
    );

  };
  $scope.setIndex = function (index, obj){
    setActive(obj.field);

    $scope.dir = $scope.dir.slice(0, index +1);

    get(
      obj.field,
      obj.filter
    );
  }


  function findIndex(arr, obj){

    var key = Object.keys(obj).pop();
    var index = false;
    arr.forEach(function (item, i){
      if (item[key] === obj[key]) {
        index = i;
      }
    });

    return index;
  }

  function get(field, filter){

    var aggr = bodybuilder()
              .agg('terms', field, {}, field);
    if (filter){
      aggr.filter('term', filter.field, filter.value);
    }
    elasticsearch.search({
      index : config.archive.index,
      type : config.archive.type,
      size : 0,
      body : aggr.build()
    }, function (err, res){
      $scope.items = res.aggregations[field].buckets;
    });
  }

  get("Source.raw", false);

}
