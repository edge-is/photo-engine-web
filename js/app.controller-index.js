
/**
 * Controller for frontpage
 */
function indexController($scope, $window){

  $scope.onTypeaheadSubmit = function submitOnSearch(query){
    $window.location = '/search.html?query=' + query;
  };

  $scope.query = "";

  $scope.queryObject = {};

}
