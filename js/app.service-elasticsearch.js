function serviceElasticsearch($http, $rootScope){

  var base = [config.api, '/es'].join('');

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
      if (res.data.error) return callback(res);
      return callback(null, res.data, res);
    }, callback)
  }

  function removeDupes(object){
    function dedupe(obj){
      if (Array.isArray(obj)){
        var cache = {};

        obj = obj.filter(function (item){
          var key = item;
          if (typeof item === 'object'){
            key = JSON.stringify(item);
          }


          var x = cache[key];
          //console.log(cache, key, x)

          cache[key] = true;

          if (x) return false;

          return true;
        });
      }else if (typeof obj === 'object')
      Object.keys(obj).forEach(function (key){
        var item = obj[key];
        obj[key] = dedupe(item);
      })

      return obj;
    }


    return dedupe(object);
  }

  return {
    get: function (options, callback){
      var requestParams = {};
      requestParams.url = buildURI(options.index, options.type, options.id);
      requestParams.method = 'GET';

      return request(requestParams, callback);

    },
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


        var filtersToApply = $rootScope.currentIndex.filters || [];

        filtersToApply.forEach(function (filter){
          var field = filter.field;
          var rawField = (config.elasticsearch.version === 'v5') ? '.keyword' : '.raw';
          if (filter.raw){
            field + rawField;
          }
          if (filter.not){
            options.body.notFilter(filter.type, field, filter.value);
          }else{
            options.body.filter(filter.type, field, filter.value);
          }
        });

        // Fix to ensure _thumbnails exists
        //
        if ($rootScope.currentIndex.ensureThumbnails){
          options.body.query('exists', 'field', '_thumbnails')
        }

        options.body = options.body.build(config.elasticsearch.version || 'v5');
      }

      if (options.body){
        requestParams.data = removeDupes(options.body);
      }

      return request(requestParams, callback);
    },
    count : function (options){

    },
  }
}
