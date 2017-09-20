function serviceLoadElasticQuery(){

  function _key(obj){
    for (var key in obj) return key;
  }

  function parseObject(obj){

    var out = {};
    out.type = _key(obj);
    out.field = _key(obj[out.type]);
    out.value = obj[out.type][out.field];
    return out;
  }

  return  {
    dedupe : function (object){
      function _dedupe(obj){
        if (Array.isArray(obj)){
          var cache = {};

          obj = obj.filter(function (item){
            var key = item;
            if (typeof item === 'object'){
              key = JSON.stringify(item);
            }

            var x = cache[key];
            cache[key] = true;
            if (x) return false;
            return true;
          });
          // If only one item in array, then remove array
          if (obj.length === 1){
            obj = obj.pop();
          }
        }else if (typeof obj === 'object')
        Object.keys(obj).forEach(function (key){
          var item = obj[key];
          obj[key] = _dedupe(item);
        })

        return obj;
      }


      return _dedupe(object);
    },
    queryString : function queryString(queryObject){
      var queryString = "";
      function find(obj){
        //console.log(obj);

        if (Array.isArray(obj)){
          obj.forEach(function (value){
            if (typeof value === 'object') return find(value)
          });
        }

        if (typeof obj === 'object'){
          Object.keys(obj).forEach(function (key){
            var value = obj[key];
            if (key === 'query_string') queryString = value.query;
            if (typeof value === 'object') return find(value)
          });
        }

      }


      find(queryObject);
      return queryString;
    },
    parse : function parse (queryObject){

      var filterTypes = {
        must : 'filter',
        should : 'orFilter',
        must_not : 'notFilter'
      }

      var query = bodybuilder();

      if (!queryObject) return query;

      if (!queryObject.query) return query;

      queryObject = this.dedupe(queryObject);

      if (queryObject.size){
        query.size(queryObject.size);
      }
      if (queryObject.from){
        query.from(queryObject.from);
      }

      // if not bool, then simple query
      if (!queryObject.query.bool) {
        var o = parseObject(queryObject.query);
        query.query(o.type, o.field, o.value);
      }else{
        // Add the filter first..

        var _filter = queryObject.query.bool.filter;
        if (_filter.bool){
          _filter = _filter.bool;
        }

        var filters = Object.keys(_filter);

        filters.forEach(function (key){
          var arr = _filter[key];

          if (Array.isArray(arr)){
            arr.forEach(function (item){
              var o = parseObject(item);
              var fnKey =  filterTypes[key];
              var fn = query[fnKey];
              if (fn){
                fn(o.type, o.field, o.value);
              }
            });
          }else{
            var o = parseObject(_filter);
            query.filter(o.type, o.field, o.value);
          }

        });


        if (queryObject.query.bool.must){

          if (Array.isArray(queryObject.query.bool.must)){
            queryObject.query.bool.must.forEach(function (item){
              var o = parseObject(item);
              query.query(o.type, o.field, o.value);
            });
          }else{
            (function (){
              var item = queryObject.query.bool.must;
              var o = parseObject(item);
              query.query(o.type, o.field, o.value);

            })();
          }
        }
      }

      if (queryObject.aggs){
        Object.keys(queryObject.aggs).forEach(function (key){
          var type = _key(queryObject.aggs[key]);
          var field = queryObject.aggs[key][type].field;
          query.agg(type,  field)
        });
      };


      var o = JSON.stringify(queryObject, null, 2);
      var n = JSON.stringify(query.build(), null, 2)

      if (o !== n){
        console.log('Could not parse query 100%');
        console.log(o);
        console.log(n);
      }

      return query;
    }
  }
}
