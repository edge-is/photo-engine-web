search.controller('archives', ['$scope', '$http',  archiveController]);


function archiveController($scope, $http){
  var url = [config.api, '/aggregates/archive'].join('');
  $scope.archives = [];


  $http.get(url).success(function (response){
    $scope.archives = response.data.results_raw;
  });
}
