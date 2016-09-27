/**
 * Controller for Archives
 */

function archiveController($scope, $http){
  var url = [config.api, '/aggregates/archive'].join('');
  $scope.archives = [];

  $http.get(url).success(function (response){
    $scope.archives = [];
    angular.forEach(response.data.results_raw, function ( value, key){
      value.filter = {archive_id : value.archive_id};
      value.filterJSON = JSON.stringify(value.filter);
      $scope.archives.push(value);
    })
  });
}
