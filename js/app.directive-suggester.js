

search.directive('typeaheadSuggest', ['suggester', directiveTypeaheadSuggest]);

function directiveTypeaheadSuggest(suggester){
  return {
    restrict : 'ACE',
    replace : true,
    require: '?ngModel',
    template : function (element, attrs){
      return '<input type="text" ng-mode="'+ attrs.ngModel +'" class="' + attrs.class + '">';
    },
    link : function ($scope, element, attrs, ngModel){

      var submit = function (){};

      if (typeof $scope[attrs.submit] === 'function'){
        submit = $scope[attrs.submit];
      }


      function orderByScore(a,b){
        if (a.score < b.score){
          return -1;
        }
        if (a.score > b.score){
          return 1;
        }
        return 0;
      }

      function joinHits(pre, hits){
        var prevString = pre.join(' ');
        return hits.map(function (hit){
          return [prevString, hit].join(' ');
        });

      }

      function parseHits (hits){

        var suggestions = [];

        for (var key in hits.suggest){
          var value = hits.suggest[key];
          if (value.length === 0) continue;
          value[0].options.forEach(function (item){
            suggestions.push(item);
          });
        }

        var results = suggestions.sort(orderByScore).reverse();

        var array = results.map(function (item){
          return item.text;
        });


        return array;
      }

      function elasticsearchSuggester(){
        return function (query, syncCallback, asyncCallback){
          var parts = query.split(' ');
          var last = parts.pop();

          suggester(last).then(function(response){
            var hits = parseHits(response.data.data);

            hits = joinHits(parts, hits);

            asyncCallback(hits);
          }, function (){
            asyncCallback([]);
          });

        };
      }




      $(element).typeahead({
        hint: true,
        highlight: false,
        minLength: 1,
        async : true,
      },
      {
        async : true,
        name: 'suggester',
        source: elasticsearchSuggester()
      });



      function updateScope (object, suggestion, dataset) {
          submit(object, suggestion, dataset);
          $scope.$apply(function () {
            var newViewValue = (angular.isDefined($scope.suggestionKey)) ?
                suggestion[$scope.suggestionKey] : suggestion;
            ngModel.$setViewValue(newViewValue);
          });
        }

        // Update the value binding when a value is manually selected from the dropdown.
        element.bind('typeahead:selected', function(object, suggestion, dataset) {

          updateScope(object, suggestion, dataset);
          $scope.$emit('typeahead:selected', suggestion, dataset);
        });

        // Update the value binding when a query is autocompleted.
        element.bind('typeahead:autocompleted', function(object, suggestion, dataset) {
          updateScope(object, suggestion, dataset);
          $scope.$emit('typeahead:autocompleted', suggestion, dataset);
        });

        // Propagate the opened event
        element.bind('typeahead:opened', function() {
          $scope.$emit('typeahead:opened');
        });

        // Propagate the closed event
        element.bind('typeahead:closed', function() {
          $scope.$emit('typeahead:closed');
        });

        // Propagate the asyncrequest event
        element.bind('typeahead:asyncrequest', function() {
          $scope.$emit('typeahead:asyncrequest');
        });

        // Propagate the asynccancel event
        element.bind('typeahead:asynccancel', function() {
          $scope.$emit('typeahead:asynccancel');
        });

        // Propagate the asyncreceive event
        element.bind('typeahead:asyncreceive', function() {
          $scope.$emit('typeahead:asyncreceive');
        });

        // Propagate the cursorchanged event
        element.bind('typeahead:cursorchanged', function(event, suggestion, dataset) {
          $scope.$emit('typeahead:cursorchanged', event, suggestion, dataset);
        });

    }
  }
}
