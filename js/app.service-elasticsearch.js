function serviceElasticsearch($http){

  var base = [config.api, '/es/'].join('');

  function buildURI(index, type, action, queryParams){
    var arr = [];

    for (var key in queryParams){
      var value = queryParams[key] || "";

      var str = [key, value].join('=');

      arr.push(str);

    }

    var queryString=arr.join('&');

    var url = [base, index, type, action].join('/');

    var uri = [url, queryString].join('?');

    return uri;
  };

  function request(requestParams, callback){
    return $http(requestParams).then(function success(res){
      return callback(null, res.data, res);
    }, callback)
  }

  return {
    search : function (options, callback){

      options.index = options.index || "";
      options.type = options.type || "";

      var queryParams = {};

      var requestParams = {};

      if (options.size !== undefined){
        queryParams.size = options.size.toString();
      }
      if (options.from !== undefined){
        queryParams.from = options.from.toString();
      }
      if (options.query){
        queryParams.query = options.query;
      }

      requestParams.url = buildURI(options.index, options.type, '_search', queryParams);
      requestParams.method = (options.body) ? 'POST' : 'GET';

      if (typeof options.body.build === 'function'){

        if (config.archive.filters){
          config.archive.filters.forEach(function (filter){
            if (filter.not){
              options.body.notFilter(filter.type, filter.field, filter.value);
            }else{
              options.body.filter(filter.type, filter.field, filter.value);
            }
          });
        }

        options.body = options.body.build();
      }

      if (options.body){
        requestParams.data = options.body;
      }

      return request(requestParams, callback);
    },
    count : function (options){

    },
  }
}
