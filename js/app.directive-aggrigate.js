/**
 * Controller for Aggrigates directive
 */

function directiveAggrigates ($http, utils, $rootScope, photoApi, $log, $location, $timeout){
  return {
    restrict : 'ACE',
    replace:true,
    scope : {
      queryObject : '=',
      query : '='
    },
    template : function (element, attrs){
      return '<div><ul class="sidebar-nav"><li class="sidebar-brand" ><p>{{title}}</p></li><li class="filterlist-list" ng-repeat="item in filterResults"><a href uib-tooltip="{{item.value}}" tooltip-append-to-body="true" tooltip-placement="right" ng-click="toggleFilters( key, item.value)"><input ng-checked="isChecked(item.value)" type="checkbox"> <span class="list-item-name">{{item.name}}</span> <span class="pull-right">{{item.count}}</span></a></li><li ng-show="moreAvailable"><a data-toggle="collapse" data-target="#restOfResulsts_{{selectedAPI}}" aria-expanded="false" aria-controls="restOfResulsts_{{selectedAPI}}" ng-click="moreAvailable=false"> Fleiri {{title}}</a></li></ul><ul id="restOfResulsts_{{selectedAPI}}" class="sidebar-nav collapse"><li class="filterlist-list " ng-repeat="item in restOfResults"><a href uib-tooltip="{{item.value}}" tooltip-append-to-body="true" tooltip-placement="right" ng-click="toggleFilters(key, item.value)"><input ng-checked="isChecked(item.value)" type="checkbox"> <span class="list-item-name">{{item.name}}</span> <span class="pull-right">{{item.count}}</span></a></li><li ng-show="!moreAvailable"><a data-toggle="collapse" data-target="#restOfResulsts_{{selectedAPI}}" aria-expanded="false" aria-controls="restOfResulsts_{{selectedAPI}}" ng-click="moreAvailable=true">Færri {{title}}</a></li></ul></div>';
    },
    link : function ($scope, element, attrs){
      $scope.key = attrs.key || "";

      $scope.title = attrs.title;

      $scope.moreAvailable = false;
      var limit = attrs.limit || 10;

      var stringMaxLength = attrs.stringLength || 15;

      stringMaxLength = +stringMaxLength;

      limit = +limit;
      var resultKey = "results";

      $scope.applydfilters = getFilters();

      $scope.selectedAPI = attrs.key;

      var rawResult = false;

      if ($scope.selectedAPI.indexOf('.raw') > -1 ){
        $scope.selectedAPI = $scope.selectedAPI.split('.')[0];
        resultKey = "results_raw";
      }
      var api = [config.api, '/aggregates/', $scope.selectedAPI].join('');

      function getQuery(){
        return $scope[attrs.query];
      }
      function getFilter(){
        return $scope[attrs.filter];
      }
      $scope.isChecked = function (value){
        return ($scope.applydfilters[$scope.key] === value)
      }

      function getFilters (){
        var params = $location.search();
        return utils.JSON.parse(params.filter) || {};
      }

      $scope.toggleFilters = function (filterKey, filterValue){
        $scope.applydfilters = $scope.applydfilters || {};
        $log.debug('ToggleFilters', $scope.applydfilters, filterKey, filterValue, $scope.applydfilters[filterKey]);

        if ($scope.applydfilters[filterKey] === filterValue){
          delete $scope.applydfilters[filterKey];
        }else{
          $scope.applydfilters[filterKey] = filterValue;
        }

        $rootScope.$emit('$filterChange', angular.copy($scope.applydfilters));
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

      function getChanges(object){
        var changes = {};

        for (var key in object){
          if (object[key].new){
            changes[key] = object[key].new;
          }
        }

        return changes;

      }

      $scope.searchInProgress = false;
      function update(_query){
        _query = angular.copy( _query || {} );
        _query.offset = 0;

        if ($scope.searchInProgress) return;

        $scope.searchInProgress = true;

        $log.debug('aggrigate::query', _query);

        photoApi.aggrigate(_query, api).then(function (response){
          var res = parseList(response.data.data[resultKey], limit, stringMaxLength);
          if (res.length > 10){
            $scope.moreAvailable = true;
          }else{
            $scope.moreAvailable = false;
          }
          var mostImages = res.slice(0,10);
          $scope.restOfResults = res.slice(10, res.length);
          $scope.filterResults= mostImages;
          $timeout(function (){
            $scope.searchInProgress = false;
          }, 300)
        });
      }
      var initLoad = $timeout(function(){
        var locationParams = $location.search();

        update(locationParams);
      }, 300);

      $rootScope.$on('$search', function (event, queryObject, newSearch){
        $log.debug('aggrigate::$search', queryObject, newSearch);
        if (initLoad.cancel) initLoad.cancel();
        update(queryObject);
      });

    }
  }
}
