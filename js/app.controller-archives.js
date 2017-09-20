/**
 * Controller for Archives
 */

function archiveGrouppingController($scope, elasticsearch, $rootScope, utils){
  var url = [config.api, '/aggregates/archive'].join('');
  $scope.archives = [];

  function getBucketValues(result){
    var key = Object.keys(result.aggregations).pop();

    if (!key) return [];
    if (!result.aggregations[key]) return [];
    if (!Array.isArray(result.aggregations[key].buckets)) return [];
    return result.aggregations[key].buckets;
  }

  var query = bodybuilder();
  var field = $rootScope.currentIndex.groupBy;

  query.aggregation('terms', field, {size: 200}).size(0);

  $scope.index = $rootScope.currentIndex.index.index;
  $scope.type = $rootScope.currentIndex.index.type;

  $scope.index_id = $rootScope.currentIndexID;

  var elasticsearchQuery = {
    index : $scope.index,
    type : $scope.type,
    size : 0,
    from : 0,
    body : query
  };

  function addQueryToBuckets(buckets){
    return buckets.map(function (bucket){
      var q = {
        type : 'term',
        field : field,
        value : bucket.key
      };

      var q = bodybuilder()
          .filter('term', field, bucket.key)
          .build($rootScope.config.elasticsearch.version || 'v5');
      bucket.base64Query = utils.base64encode(q);
      bucket.query = q;
      return bucket;
    });
  }

  elasticsearch.search(elasticsearchQuery, function (err, res){
    if (err) return console.log('Error', err);
    var buckets = getBucketValues(res);
    $scope.archives = addQueryToBuckets(buckets);
  });

}
