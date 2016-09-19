
search.controller('index', ['$scope','$window', indexController]);

function indexController($scope, $window){

  $scope.onTypeaheadSubmit = function submitOnSearch(query){
    $window.location = '/search.html#?query=' + query;
  };

}
