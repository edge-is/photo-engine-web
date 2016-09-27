

/**
 * Service providing connection to the Photo-Engine API
 */
function photoApiService($http, $q, utils, $log){
  /**
   * Helpers
   */
  function post(url, data){
    return $http.post(url, data);
  };
  function get(url){
    return $http.get(url);
  };

  return {
    getByID : function (id){
      var url = [config.api, '/image/', id].join('');
      return get(url);
    },
    filter : function (filter){

    },

    query : function (queryObject, options){


      var _query = angular.copy(queryObject);


      var deferred = $q.defer();
      options = options || {};

      var baseURI = [config.api,'/search/query'].join('');

      _query.limit = _query.limit || 30;
      _query.offset = _query.offset || 0;


      var url = utils.createURI(baseURI, _query);

      $http.get(url).success(function(data){
        deferred.resolve(data);
    	}).error(function(data){
        deferred.reject(data);
      });
      return deferred.promise;
    },
    aggrigate : function (queryObject, api){
      queryObject = queryObject || {};

      var _query = angular.copy(queryObject);
      if (!api) return $log.error('No API selected');

      if (uri === '?') return;
      if (_query.query){
        if (_query.query.charAt(_query.query.length -1) !== '*') _query.query+="*";
      }
      var uri = utils.createURI(api, _query);
      return get(uri);
    },
    suggest : function (queryObject, options){

      var _query = angular.copy(queryObject);
      options = options || {};
      var baseURI = [config.api, '/search/suggest/phrase'].join('');

      _query.limit = 100;
      _query.offset = 0;

      var uri = utils.createURI(baseURI, _query);

      return $http.get(uri);
    }
  }
}
