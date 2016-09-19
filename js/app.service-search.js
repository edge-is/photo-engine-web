
search.service('apiSearch',[ '$http','$q', 'utils', serviceApiSearch]);

function serviceApiSearch($http, $q, utils){
  function post(url, data){
    return $http.post(url, data);
  };
  function get(url){
    return $http.get(url);
  };

  return {
      typeahead : function (query){

      },
      filter : function (filter){

      },

      query : function (queryObject, options){
        var deferred = $q.defer();
        options = options || {};

        var baseURI = [config.api,'/search/query'].join('');

        queryObject.limit = queryObject.limit || 30;
        queryObject.offset = queryObject.offset || 30;


        var url = utils.createURI(baseURI, queryObject);

        $http.get(url).success(function(data){
          deferred.resolve(data);
      	}).error(function(data){
          deferred.reject(data);
        });
        return deferred.promise;
      }
    }
  }
