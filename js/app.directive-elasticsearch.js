
function directiveElasticsearch(elasticsearch, $rootScope){
  return {
      restrict: 'AE',
      templateUrl : 'views/templates/elasticsearch-radio-checkbox.html',
      replace:true,
      scope: {
        lastQuery: '=',
        onToggle : '&'
      },
      link: function($scope, element, attrs) {

        $scope.items = [];
        if (!attrs.aggregate) return;

        $scope.checkCache = {};

        $scope.esType = attrs.esType || 'radio';

        $scope.toggle = function ( field, item, type){

          var id = item.id;
          var query = angular.copy($scope.lastQuery);

          if (!$scope.checkCache[id]){
            $scope.checkCache[id] = true;
            query.filter('term', field, item.key);
          }else{
            $scope.checkCache[id] = false;

          }

          var fn = $scope.onToggle({query:query});
          if (typeof fn === 'function'){
            fn(query);
          }
        }
        var rawField = "";
        if(!attrs.raw){
          rawField = (config.elasticsearch.version === 'v5') ? '.keyword' : '.raw';
        }
        $scope.field = attrs.aggregate + rawField;

        $scope.title = attrs.title;

        $scope.$watch('lastQuery', function (_new, _old){
          if (!_new.query) return;

          _new.agg('terms', $scope.field, {size : 10} );
          var elasticsearchQuery = {
            index : attrs.index,
            type : attrs.type,
            body : _new
          };
          elasticsearch.search(elasticsearchQuery, function (err, res){
            if(err) return console.error(err);
            $scope.items = addId(getBuckets(res));
          });
        })

        function addId(arr){
          return arr.map(function (i){
            i.id = ['ID::', i.key, i.doc_count].join('');
            return i;
          })
        }

        function first(obj){
          for (var key in obj) return key;
        }

        function getBuckets(result){
          if (!result.aggregations) return [];
          var key = Object.keys(result.aggregations).pop();
          if (!key) return [];

          return result.aggregations[key].buckets;

        }

      }
  };
}
