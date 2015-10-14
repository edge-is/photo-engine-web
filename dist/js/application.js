var search = angular.module('search', []);

search.controller('main',
[
  '$scope'
, function ($scope){
    $scope.MainSearchHidden = true;
    $scope.MainSearch='';
    $scope.StartSearch='';
    $scope.$watch('StartSearch', function (_new, _old){
      if($scope.StartSearch.length > 0){
        angular.element('#mainsearch').focus();
        $scope.MainSearchHidden=false;
        setTimeout(function (){
          $scope.StartSearchHidden=true;
        }, 20)
      }
      $scope.MainSearch = $scope.StartSearch;
    });



    $scope.typeaheadquery = '';

    var TEMPHOST = 'http://uts28796.lsh.is:3000'

    var TypeaheadEngine = new Bloodhound({
      datumTokenizer: function(d) {return Bloodhound.tokenizers.whitespace(d); },
      queryTokenizer:  Bloodhound.tokenizers.whitespace,
      remote : {
        url : TEMPHOST + '/api/search?type=bloodhound&query=%QUERY*',
        filter : function (d){
          if(d.status == 'success'){
            return d.data;
          }else{
            return [];
          }
        }
      }
    });


    TypeaheadEngine.initialize();
    $scope.numbersDataset = {
      displayKey: 'hit',
      source: TypeaheadEngine.ttAdapter()
    };

    // Typeahead options object
    $scope.exampleOptions = {
      highlight: true
    };

    $scope.exampleOptionsNonEditable = {
      highlight: true,
      editable: false // the new feature
    };

  }
]);



search.filter('propsFilter', [function() {
  return function(items, props) {
    var out = [];

    if (angular.isArray(items)) {
      items.forEach(function(item) {
        var itemMatches = false;

        var keys = Object.keys(props);
        for (var i = 0; i < keys.length; i++) {
          var prop = keys[i];
          var text = props[prop].toLowerCase();
          if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
            itemMatches = true;
            break;
          }
        }

        if (itemMatches) {
          out.push(item);
        }
      });
    } else {
      // Let the output be the input untouched
      out = items;
    }

    return out;
  };
}]);


search.service('search',
[
  '$http',
  function ($http){
  return {
      typeahead : function (query){

      },
      filter : function (filter){

      },
      search : function (){

      }
    }
  }
]);
