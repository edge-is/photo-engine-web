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

  $scope.index = config.archive.index;
  $scope.type = config.archive.type;

  $scope.dir = [];

  $scope._current = 0;


 var fields = {
    'Source.raw'        : 'UserDefined4.raw',
    'UserDefined4.raw'  : 'UserDefined12.raw',
    'UserDefined12.raw' : 'UserDefined14.raw',
    'UserDefined14.raw' : false
  };


  var aggr = bodybuilder()
              .agg('terms', 'Source.raw', {}, function (q){
                return q.agg('terms', 'UserDefined4.raw', function (q){
                  return q.agg('terms', 'UserDefined12.raw', function (q){
                    return q.agg('terms', 'UserDefined14.raw');
                  });
                });
              });

  elasticsearch.search({
    index : config.archive.index,
    type : config.archive.type,
    size : 1,
    body : aggr.build()
  }, function (err, res){
    //console.log(err, res.hits.hits);

    $scope.originalResponse=angular.copy(res);
    $scope.aggregates = res;

    var items= res.aggregations['agg_terms_Source.raw'].buckets //.buckets.pop();

    //console.log(x['agg_terms_UserDefined4.raw']);
    //var items= x['agg_terms_UserDefined4.raw'].buckets;
    //


    var items = selectItems(items, 'Source.raw', 'UserDefined4.raw');

    $scope.originalItems = items;
    $scope.items = items;
  });

  $scope.goToStart = function (){
    $scope.selectedValues = [];
    $scope.items = $scope.originalItems;
  }

  function selectItems(arr, field, next, name){
    name = name || "";
    return arr.map(function (item){
      item._name = [name, item.key].join(' ');
      item._next = next;
      if (field){
        item._query = { type : 'term', field : field, value : item.key };
      }
      return item;
    });
  }
  $scope.selectedValues = [];
  function buildURI(object){
    var arr = [];

    for (var key in object){
      var value = object[key];
      arr.push(
        [key, value].join('=')
      );
    }

    return arr.join('&');

  };

  function createURIfilter(arr){
    return {
      filter : ['BASE64', Base64.encode(JSON.stringify(arr))].join(':')
    };
  }

  function getQuerys(arr){
    return arr.map(function (item){
      return item._query;
    });
  }

  $scope.linkSelect = function (object, index){
    $scope.selectedValues.splice(index , $scope.selectedValues.length);
    $scope.select(object);
  };


  $scope.select = function (object){

    $scope.selectedValues.push(object);
    var field = object._next;
    console.log($scope.selectedValues);
    if (!field){
      var filter = createURIfilter(getQuerys($scope.selectedValues));
      return window.location = '/displayArchive.html?' + buildURI(filter);
    }


    var next = fields[field];
    var items = object['agg_terms_' + field].buckets;

    if (!items){
      $scope.items = [];
    }
    if (items.length === 0 ){
      $scope.items = [];
    }
    $scope.items = selectItems(items, field, next, object._name);

  }
  /*
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

  get("Source.raw", false);*/

}
