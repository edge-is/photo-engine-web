


function directiveFilterList ($http, utils, $rootScope, photoApi){
  return {
    restrict : 'ACE',
    replace:true,
    scope : {
      queryObject : '=',
      query : '='
    },
    template : function (element, attrs){
      var credit_raw = "'" + attrs.filterKey + "'";
      return '<ul class="sidebar-nav"><li class="filterlist-list" ng-repeat="item in filterResults"><a href uib-tooltip="{{item.value}}" tooltip-append-to-body="true" tooltip-placement="right" ng-click="toggleFilters('+credit_raw+', item.value)"><input ng-checked="applydfilters['+credit_raw+'] === item.value" type="checkbox"> <span class="list-item-name">{{item.name}}</span> <span class="pull-right">{{item.count}}</span></a></li></ul>';
    },
    link : function ($scope, element, attrs){
      var api = attrs.api;

      var limit = attrs.limit || 10;

      var stringMaxLength = attrs.stringLength || 15;

      var resultKey = "results_raw";

      $scope.applydfilters = {};

      if (attrs.resultType === 'raw'){
        var resultKey = "results_raw";
      }

      function getQuery(){
        return $scope[attrs.query];
      }
      function getFilter(){
        return $scope[attrs.filter];
      }
      $scope.toggleFilters = function (filterKey, filterValue){

        if (!$scope.queryObject.filter){
          $scope.queryObject.filter = {};
        }
        if ($scope.applydfilters[filterKey] === filterValue){
          delete $scope.applydfilters[filterKey];
          delete $scope.queryObject.filter[filterKey];
          return update($scope.queryObject);
        }
        $scope.applydfilters[filterKey] = filterValue;
        $scope.queryObject.filter[filterKey] = filterValue;
        update($scope.queryObject);
      }
      function parseList(array, limit, stringMaxLength){
        return array.map(function (item){
          var text = item.name;

          item.value = text;
          if (text.length > stringMaxLength){
            item.name = text.substring(0, stringMaxLength);
            item.name +="..";
          }

          return item;

        });

        return array;
      }

      $rootScope.$on('queryUpdate', function (event, _new, _old){
        update({ query: _new, filter : $scope.queryObject.filter });
      });

      function update(_query){
        _query = _query || {};

        console.log('API', api)
        photoApi.aggrigate(_query, api).then(function (response){
          $scope.filterResults= parseList(response.data.data[resultKey], limit, stringMaxLength);
        });
      }
      update();
    }
  }
}
