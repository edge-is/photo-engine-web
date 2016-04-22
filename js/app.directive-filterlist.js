search.directive('filterList', ['$http', 'utils', directiveFilterList]);



function directiveFilterList ($http, utils){
  return {
    restrict : 'ACE',
    template : function (element, attrs){


      var credit_raw = "'" + attrs.filterKey + "'";

      return '<li ng-repeat="photographer in photographers"><a href ng-click="addToFilter('+credit_raw+', photographer.name)"><input ng-checked="filters['+credit_raw+'] === photographer.name" type="checkbox"> {{photographer.name}} <span class="pull-right">{{photographer.count}}</span></a></li>';
    },
    link : function ($scope, element, attrs, ngModel){
      var api = attrs.api;

      console.log(attrs);

      function getQuery(){
        return $scope[attrs.query];
      }
      function getFilter(){
        return $scope[attrs.filter];
      }



      var x = utils.createURI(api, {
        query : 'foo-barbars',
        filter : 'barasdf<zza1,aa4,a4asd'
      });


      if (attrs.filter){

        $scope.$watch(attrs.filter, function (_new, _old){
          update(getQuery(), getFilter());
        });
      }

      if (attrs.query){

        $scope.$watch(attrs.query, function (_new, _old){
          console.log(_new, _old);
          update(getQuery(), getFilter());
        });
      }

      function update(query, filter){

        console.log(filter, query);

        var queryParams = {};

        queryParams.filter = filter || false;

        queryParams.query = query || false;
        var uri = utils.createURI(api, queryParams);


        $http.get(uri).then(function (response){
          console.log(response.data);

          $scope[attrs.dataset] = response.data.data.results;
        })

      }

      update();


    }
  }
}
