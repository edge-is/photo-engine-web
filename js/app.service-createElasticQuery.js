function serviceCreateElasticQuery(){
  return {
    create : function create(queryObject){
      var query = bodybuilder();

      var list = ['query', 'filter', 'aggregation'];


      list.forEach(function (item){

        var value = queryObject[item]

        if (value){
          value.forEach(function (object){
            var fn = query[item];
            fn(object.type, object.field, object.value);
          });
        }
      });

      return query;


    },
    queryString : function queryString(queryObject){

      console.log(queryObject)
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
    }
  }

}
