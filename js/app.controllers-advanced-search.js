search.controller('AdvancedSearchController', [
  '$scope',
  '$modalInstance',
  'data',
  'translate',
  function ($scope, $modalInstance, data, translate) {

    var AdvancedSearchTemplate = function  (){
      return { bool : 'AND', key : '', operator : '==', query : '' };
    };

    $scope.advanced_search_query = [ new AdvancedSearchTemplate()];
    $scope.advanced_search_fields = [];

    $.each(settings.search.fields, function (key, value){
      var translated = translate(key);
      var string = key;

      if(translated){
        string = translated.name;
      }

      $scope.advanced_search_fields.push({ name: string, key : key });
    });

    $scope.advanced_search_add = function (index){
      $scope.advanced_search_query.push( new AdvancedSearchTemplate());
    };

    $scope.advanced_search_remove = function (i) {
      $scope.advanced_search_query.splice( i , 1 );
    };

    $scope.search = function (){
      console.log($scope.advanced_search_query);
      //$modalInstance.close({ the:'query'});
    };

    $scope.close = function () {
      $modalInstance.dismiss();
    };

  }]);
