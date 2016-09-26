

function serviceOSM(map){
  return {
    search : function (queryObject, callback){
      console.log('OSM');
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
        // map.osm(osmParams).then(function (d){
        //   if(d.length > 0){
        //     $scope.MapLoaded = true;
        //     //angular.extend($scope, )
        //     $scope.center = {
        //       lat : +d[0].lat,
        //       lng : +d[0].lon,
        //       zoom : 4
        //     };
        //     $scope.mapmarker = {
        //       m1 : {
        //         lat : +d[0].lat,
        //         lng : +d[0].lon,
        //         message : 'Wazzuuup?',
        //         icon: 'img/map-marker.png'
        //       }
        //     };
        //   }
        // });
      };
    }
  };

}
