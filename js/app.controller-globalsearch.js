
search.controller('globalsearch', ['$scope', '$window',  globalsearchController]);



function globalsearchController($scope, $window){
  $scope.global_search = function (){
    if ($scope.query){
      $window.location = '#/?query=' + $scope.query;
    }
  }
};
