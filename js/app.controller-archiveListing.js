/**
 * Controller for Archive Listing
 */

function archiveListingController($scope, elasticsearch, $rootScope, $location, utils){
  $scope.items = [];
  $scope.images = [];

  $scope.showSearchBar = config.searchbar;


  var rawField = config.rawField || '.keyword';

  $scope.query = "";
  $scope.queryObject = {};

  $scope.openInNewWindow = false;

  $scope.selectedValues = [];

  $scope.index = $rootScope.currentIndex.index.index;
  $scope.type = $rootScope.currentIndex.index.type;

  $scope.description = $rootScope.currentIndex.description;


  $scope.showDescription = true;

   var _order = setKeyword([
     'Source{{KEYWORD}}',
     'UserDefined4{{KEYWORD}}',
     ['UserDefined12{{KEYWORD}}', 'UserDefined14{{KEYWORD}}']
   ]);

   function setKeyword(arr){
     var keyWord = (config.elasticsearch.version === 'v5') ? '.keyword' : '.raw';
     if (!Array.isArray(arr)) return arr;
     return arr.map(function (value){
       if (Array.isArray(value)) return setKeyword(value);

       if (typeof value === 'string' && (value.indexOf('{{KEYWORD}}') > -1 )){

         value = value.replace(/\{\{KEYWORD\}\}/, keyWord);
       }
       return value;
     })
   }

   function getAgg(field, filters, callback){
     var query = bodybuilder();

     var queryField = field;


     if (Array.isArray(field)){
       queryField = field[0];
     }
    // Create the query
    if (!Array.isArray(field)){
      query.agg('terms', queryField, { size : 100 });
    }else{
      query.agg('terms', queryField, { size : 100 }, function (q){
        return q.agg('terms', field[1], { size : 100 });
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
       index : $scope.index,
       type : $scope.type,
       size : 1,
       body : query
     }, function (err, res){

       return callback(err, res);
     });
   }

   function orderByName(arr){
     return arr.sort(function(a, b) {
        var aKey = a._name.toUpperCase(); // ignore upper and lowercase
        var bKey = b._name.toUpperCase(); // ignore upper and lowercase

        if (aKey < bKey) {
          return -1;
        }
        if (aKey > bKey) {
          return 1;
        }
        return 0;
      });
   }


   function init(getFilters){
     var keywordField = (config.elasticsearch.version === 'v5') ? '.keyword' : '.raw';
     var field = 'Source' + keywordField;
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
       if (err) return console.error(err);

       var arr =  parseAggBuckets(res.aggregations, $scope.selectedValues);

       $scope.items = orderByName(arr);
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
     var filter = {
       filter : utils.base64encode(angular.toJson(x))
     };
     return buildURI(false, filter);
   }

   function parseAggBuckets(agg, parentArray){

     var aggField = getField(agg);

     var buckets = agg[aggField].buckets;
     var areSubBuckets = false;

     function bucketParser(item, field){
       var index = _order.indexOf(field);

       var subAggregationFieldRaw = hasAgg(item);

       if (subAggregationFieldRaw){
         areSubBuckets = true;

         var b = item[subAggregationFieldRaw].buckets;

         if (!item._subBuckets){
           item._subBuckets = [];
         }

         var subAggregationField = getFieldName(subAggregationFieldRaw);

         b.forEach(function (_item){
           item._subBuckets.push(
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
       item._rawName = [item.key];

       return item;
     }


     var bucketContent = [];

      buckets.forEach(function (item){
        bucketContent.push(
          bucketParser(item,
            getFieldName(aggField)
          )
        );

      });


      if (areSubBuckets){

        return joinBuckets(bucketContent);
        // Join buckets and create one...
      }
     return bucketContent;
   }

   function joinBuckets(buckets){

     var arr = [];

     buckets.forEach(function (bucketItem){
       var b = bucketItem._subBuckets;
       b.forEach(function (subBucketItem){
         var obj = angular.copy(bucketItem);

         obj._name =  [bucketItem._name, subBucketItem._name].join(' ');
         obj._index = false;
         obj._next = false;

         obj._rawName.push(
           subBucketItem._key
         );

         obj._parents.push(bucketItem._query);

         obj._query = subBucketItem._query;

         arr.push(obj);
       });

     });

     return arr;
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

     var filter = {
       filter : utils.base64encode(angular.toJson(filters))
     };
     if (!item._next){
       return buildURI('displayarchive.html', filter);
     }

     return buildURI(false, filter);
   }

   function getURIFilter(){
     var filterRaw = $location.search().filter;
     if (filterRaw){
       return utils.base64decode(filterRaw);
     }
     return false;

   }

   function buildURI(location, object){

     if (!location){

       location = $location.$$path;
     }

     var index_id = [ 'index_id' , $rootScope.currentIndexID].join('=');

     var arr = [ index_id ];

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
