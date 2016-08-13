search.directive('filterList', ['$http', 'utils', directiveFilterList]);



function directiveFilterList ($http, utils){
  return {
    restrict : 'ACE',
    replace:true,
    template : function (element, attrs){


      var credit_raw = "'" + attrs.filterKey + "'";

      return '<ul class="sidebar-nav"><li ng-repeat="item in ' + attrs.dataset + '"><a href ng-click="addToFilter('+credit_raw+', item.name)"><input ng-checked="filters['+credit_raw+'] === item.name" type="checkbox"> {{item.name}} <span class="pull-right">{{item.count}}</span></a></li></ul>';
    },
    link : function ($scope, element, attrs, ngModel){
      var api = attrs.api;

      var resultKey = "results_raw";

      if (attrs.resultType === 'raw'){
        var resultKey = "results_raw";
      }

      function getQuery(){
        return $scope[attrs.query];
      }
      function getFilter(){
        return $scope[attrs.filter];
      }


      if (attrs.filter){

        $scope.$watch(attrs.filter, function (_new, _old){
          update(getQuery(), getFilter());
        });
      }

      if (attrs.query){

        $scope.$watch(attrs.query, function (_new, _old){
          update(getQuery(), getFilter());
        });
      }

      function update(query, filter){
        var queryParams = {};

        queryParams.filter = filter || false;

        queryParams.query = query || false;
        var uri = utils.createURI(api, queryParams);

        if (uri === '?') return;

        $http.get(uri).then(function (response){
          console.log(response)
          $scope[attrs.dataset] = response.data.data[resultKey];
        })

      }
      update();
    }
  }
}
