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

  $scope.openInNewWindow = false;

  $scope.selectedValues = [];

  $scope.index = config.archive.index;
  $scope.type = config.archive.type;

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
   };

   var _order = [
     'Source.raw',
     'UserDefined4.raw',
     ['UserDefined12.raw', 'UserDefined14.raw']
   ];

   function getAgg(field, filters, callback){
     var query = bodybuilder();

     var queryField = field;


     if (Array.isArray(field)){
       queryField = field[0];
     }


    // Create the query
    if (!Array.isArray(field)){
      query.agg('terms', queryField, {size : 100 });
    }else{
      query.agg('terms', queryField, {size : 100 }, function (q){
        return q.agg('terms', field[1], {size : 100 });
      });
    }

    if (filters){
      filters.forEach(function (filter){

        query.filter(
          filter.type,
          filter.field,
          filter.value
        );
      });
    }

     elasticsearch.search({
       index : config.archive.index,
       type : config.archive.type,
       size : 1,
       body : query
     }, function (err, res){

       return callback(err, res);
     });
   }


   function init(getFilters){
     var query = bodybuilder();
     var field = 'Source.raw';
     var filter = getURIFilter();
     if (getFilters){

       if (filter){
         var f = filter[filter.length -1 ];
         var _i = _order.indexOf(f.field);
         if (_i > -1){
           _i = _i + 1;
           field = _order[_i];
         }
       }
     }

     $scope.selectedValues = filter || [];

     getAgg(field, filter, function (err, res){
       $scope.items = parseAggBuckets(res.aggregations, $scope.selectedValues);
     });
   }
   function getField(agg){

     for (var key in agg){
       return key;
     }

   }

   $scope.goToStart = function (){
     $location.search('filter', '');
     init(false);
   }

   $scope.getHistoryURI = function (item, index){

     var x = $scope.selectedValues.slice(0, index + 1 );
     var filter = createURIfilter(x);
     return buildURI(false, filter);
     return "";
   }

   function parseAggBuckets(agg, parentArray){

     var aggField = getField(agg);

     var buckets = agg[aggField].buckets;

     var allBuckets = [];

     var subBuckets = [];

     function bucketParser(item, field){
       var index = _order.indexOf(field);

       var subAggregationFieldRaw = hasAgg(item);

       if (subAggregationFieldRaw){
         var b = item[subAggregationFieldRaw].buckets;

         var subAggregationField = getFieldName(subAggregationFieldRaw);

         b.forEach(function (_item){
           subBuckets.push(
             bucketParser(_item, subAggregationField)
           );
         });
       }

       var next = index + 1;

       if (index === -1){
         next = false
       }else{
         next = _order[next];
       }


       if (!next){
         if ( $scope.openInNewWindow){
           item._target = '_blank';
         } else{
           item._target = '_self';
          }
       }

       item._parents = parentArray.slice();
       item._index = index;
       item._field = field;
       item._query = { type : 'term', field : field, value : item.key };
       item._name = item.key;
       item._next = next;

       return item;
     }


     var firstBuckets = [];

      buckets.forEach(function (item){
        firstBuckets.push(
          bucketParser(item,
            getFieldName(aggField)
          )
        );

      });


      if (subBuckets.length > 0){

        return joinBuckets(firstBuckets,subBuckets);
        // Join buckets and create one...
      }
     return firstBuckets;
   }

   function joinBuckets(bucketsA, bucketsB){
     var buckets = [];

     bucketsA.forEach(function (bA){

       bucketsB.forEach(function (bB){
         var obj = angular.copy(bA);

         obj._parents.push(bA._query);

         obj._index = false;
         obj._next = false;
         obj._name = [bA._name, bB._name].join(' ');

         buckets.push(obj);
       });
     });

     return buckets;
   }

   function hasAgg(obj){
     for (var key in obj){
       if (key.indexOf('agg_') > -1){
         return key;
       }

     }
     return false;
   }

   $scope.getUri = function (item){
     var filters = item._parents.slice();
     filters.push(item._query);

     var filter = createURIfilter(filters);
     if (!item._next){
       return buildURI('/displayarchive.html', filter);
     }

     return buildURI(false, filter);
   }

   function getURIFilter(){
     var filterRaw = $location.search().filter;
     if (filterRaw){
       return decodeURIfilter(filterRaw);
     }
     return false;

   }

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

   function buildURI(location, object){

     if (!location){

       location = $location.$$path;
     }
     var arr = [];

     for (var key in object){
       var value = object[key];
       arr.push(
         [key, value].join('=')
       );
     }

     var q = arr.join('&');

     return [location, q].join('?');
   };

   function getFieldName(field){
     return field.split('agg_terms_').pop();
   }

   init(true);

   $rootScope.$on('$locationChangeSuccess', function (event, _New, _Old){
     init(true);
   });

}
