search.service('utils', serviceUtils);

function serviceUtils(){
  return {
    createURI : function (url, queryParams){

      var queryParamsArray = [];
      for (var key in queryParams ){
        var value = queryParams[key];

        if (!value) continue;

        queryParamsArray.push([key, value].join('='));
      }

      var queryString = queryParamsArray.join('&');


      return [url, queryString].join('?');
    },
    each : function (collection, callback){

      (function (collection, callback){
        for (var key in collection){
          callback(key, collection[key]);
        }
      })(collection, callback);
    }
  }
}
