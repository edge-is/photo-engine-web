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
  $scope.selectedValues = [];

  $scope._current = 0;

  var filters = $location.search().filter;

  if (filters){
    filters = decodeURIfilter(filters);
    if (typeof filters !== 'object'){
      filters = false;
    }
  }


 var fields = {
    'Source.raw'        : 'UserDefined4.raw',
    'UserDefined4.raw'  : false,
    'UserDefined12.raw' : false,
    'UserDefined14.raw' : false
  };

  var order =  {
    'Source.raw'        : 'UserDefined4.raw',
    'UserDefined4.raw'  : 'UserDefined12.raw',
    'UserDefined12.raw' : 'UserDefined14.raw',
    'UserDefined14.raw' : false
  }

  function fetchBucketsValues(aggregations){
    function _fetch(obj){
      var o = {};
      for (var key in obj){
        var value = obj[key];
        if (value.buckets){
          value.buckets.map(function (item){
            if (key.indexOf('agg_terms_') > -1 ){
              key = key.split('agg_terms_').pop();
            }
            o[item.key] = _fetch(item);
          });
        }
      }
      return o;
    }

    return _fetch(aggregations);
  }


  var query = bodybuilder();

    query.agg('terms', 'Source.raw', {size : 100 }, function (q){
      return q.agg('terms', 'UserDefined4.raw', {size : 100 }, function (q){
        return q.agg('terms', 'UserDefined12.raw', {size : 100 }, function (q){
          return q.agg('terms', 'UserDefined14.raw', {size : 100 });
        });
      });
    });
  /*if (filters){
    filters.forEach(function(filter){
      query.filter(filter.type, filter.field, filter.value);
    })
  }*/

  elasticsearch.search({
    index : config.archive.index,
    type : config.archive.type,
    size : 1,
    body : query.build()
  }, function (err, res){
    //console.log(err, res.hits.hits);
    //console.log(res);
    var bucketValues = fetchBucketsValues(res.aggregations);

    //console.log('bucketValues', bucketValues);
    $scope.originalResponse=angular.copy(res);
    $scope.aggregates = res;

    var bucketData= res.aggregations['agg_terms_Source.raw'].buckets //.buckets.pop();
    var next = fields['Source.raw'];

    var items = selectItems(bucketData, 'Source.raw', next);



    $scope.originalItems = items;

    if (filters){
    /*  console.log('Fitlers', filters);
      var x = res.aggregations;
      var _arr = [];
      $scope.selectedValues = [];
      filters.forEach(function (filter, i){
        var key = 'agg_terms_'+filter.field;
        if (x[key]){
          _arr.push(x[key]);
          x=x[key].buckets[0];
          var next = fields['Source.raw'];
          var items =

        }




      });*/
    }

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

  function decodeURIfilter(string){
    var decoded =  Base64.decode(
      string.split(':').pop()
    );
    try {
      return JSON.parse(decoded);
    } catch (e) {
      return decoded;
    }
  }

  function createURIfilter(arr){
    return {
      filter : ['BASE64', Base64.encodeURI(angular.toJson(arr))].join(':')
    };
  };

  function getQuerys(arr){
    return arr.map(function (item){
      return item._query;
    });
  }

  $scope.linkSelect = function (object, index){
    $scope.selectedValues.splice(index , $scope.selectedValues.length);
    $scope.select(object);
  };



  $scope.last = function (object){
    //console.log('LAST', object, $scope.selectedValues);

    var next = order[object._query.field];

    //console.log('NEXT', next);
    var query = bodybuilder();
    var results = [];

    query.agg('terms', 'UserDefined12.raw', {size : 100 }, function(q){
      return q.agg('terms', 'UserDefined14.raw', {size : 100 });
    });
    $scope.selectedValues.forEach(function (item){
      var q = item._query;
      query.filter(q.type, q.field, q.value);
    });

    elasticsearch.search({
      index : config.archive.index,
      type  : config.archive.type,
      body  : query.build()
    }, function (err, res){
      //console.log(query.build(), res);
      var object = {};
      var array = [];

      var aggr1 = res.aggregations['agg_terms_UserDefined12.raw'].buckets;

      aggr1.forEach(function (item){
        object[item.key] = [];
        item['agg_terms_UserDefined14.raw'].buckets.forEach(function (bucketItem){
          object[item.key].push(bucketItem);
          var obj = {
            _next : 'href',
            _query : { field : 'UserDefined14.raw', type:'term', value : bucketItem.key },
            _name : [ item.key, bucketItem.key].join(' '),

          };
          array.push(obj);
        });
      });

      // flatten it..
      //
      //
      $scope.items = array;


      //console.log(object);

      /*var aggr = res.aggregations['agg_terms_UserDefined12'].buckets;

      $scope.items = aggr.map(function (item){
        var name = [ object.key , item.key].join(' ');
        var q = { type : 'term', value : item.key, field : next };
        return { _name : name, _next : 'href', _query : q };
      });



      console.log(aggr);

      //console.log(err, res, query.build());*/
    })
  };




  $scope.select = function (object){

    $scope.selectedValues.push(object);
    var field = object._next;
    //console.log('SELECT', $scope.selectedValues, object, field, fields[field]);
    if (!field){
      return $scope.last(object);

    }
    if (field === 'href'){
      var filter = createURIfilter(getQuerys($scope.selectedValues));
      return window.location = '/displayarchive.html?' + buildURI(filter);
      //return console.log('HREF', field, object, $scope.selectedValues);
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

}
