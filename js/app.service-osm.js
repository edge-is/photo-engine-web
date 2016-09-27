/**
 * Service for looking up in Open Street Map
 */

function serviceOSM(map){
  return {
    search : function (queryObject, callback){
      var osmParams = {};
      var searchOSM=false;
      if ('City' in queryObject){
        searchOSM=true;
        osmParams.city = queryObject.City;
      }else if('State' in queryObject){
        searchOSM=true;
        osmParams.state = queryObject.State;
      }
      if('Country' in queryObject){
        if(queryObject.Country.split(' ').length <= 2){
          osmParams.Country = queryObject.Country;
        }
      }
      if(searchOSM == true){
        map.osm(osmParams).then(callback);
      };
    }
  };

}
