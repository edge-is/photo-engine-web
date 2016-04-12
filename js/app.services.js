search.service('_search',
[
  '$http',
  '$q',
  function ($http, $q){
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
      advancedSearch : function (queryObject, options){
        if(!options){
          options = {};
        }
        var limit = options.limit || 30;
        var offset = options.offset || 0;
        var deferred = $q.defer();
        var url = [config.api,'/search/advanced?'].join('');
        url += 'limit=' + limit;
        url += '&offset=' + offset;

        return post(url, queryObject);
      },
      query : function (query, options){
        if(!options){
          options = {};
        }
        var limit = options.limit || 30;
        var offset = options.offset || 0;
        var deferred = $q.defer();
        var url = [config.api,'/search/query?'].join('');
        url += 'limit=' + limit;
        url += '&offset=' + offset;
        url += '&query=' + query;
        $http.get(url).success(function(data){
          deferred.resolve(data);
      	}).error(function(data){
          deferred.reject(data);
        });
        return deferred.promise;
      }
    }
  }
]);


search.service('map', [
  '$http',
  '$q',
  function ($http, $q){
    return {
      osm : function (query){
        var deferred = $q.defer();
        var params = {
          url : "https://nominatim.openstreetmap.org/search.php",
          method : 'GET',
          params : query
        };
        params.params.format = 'json';
        $http(params).success(function(data){
          deferred.resolve(data);
      	}).error(function(data){
          deferred.reject(data);
        });
        return deferred.promise;
      }
    }

}]);

search.service('translate', [ function (){
  return function (text){
    if (('lang' in window) === false){
      return { name : text};
    }
    if (text in lang){
      var translated = lang[text];
      if (translated.name !== ""){
        return translated;
      }else{
        return { name : text};
      }
    }else{
      return { name : text};
    }
  };
}]);
