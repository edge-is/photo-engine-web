

function serviceUtils(){
  return {
    JSON : {
      parse : function (json){
        try {
          return JSON.parse(json);
        } catch (e) {
          return false;
        }
      },
      stringify : function (object){
        try {
          return JSON.parse(object);
        } catch (e) {
          return false;
        }
      }
    },
    base64encode : function (input){

      if (typeof input === 'object'){
        input = JSON.stringify(input);
      }

      return Base64.encodeURI(input);
    },
    base64decode : function (input){
      var self = this;
      var decoded = Base64.decode(input);

      var obj = self.JSON.parse(decoded);

      if (obj) return obj;
      return decoded;
    },
    createURI : function (url, query){

      var queryParams = angular.copy(query);

      if (query.api){
        delete query.api;
      }
      var queryParamsArray = [];
      for (var key in queryParams ){
        var value = queryParams[key];

        if (typeof value === 'object') {
          value = JSON.stringify(value);
        }

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
