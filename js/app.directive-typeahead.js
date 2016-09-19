
search.directive('typeaheadSearch', ['suggester', typeaheadDirective]);

function typeaheadDirective(suggester){
  return {
    restrict : 'ACE',
    replace : true,
    // scope : {
    //   onTypeaheadSubmit : '&'
    // },
    template : function (element, attrs){
      console.log(element, attrs);
      //return '<form class="navbar-form navbar-right" ng-submit="submit();" ><div class="form-group"><input type="text" ng-model="query" class="form-control" placeholder="Leita í öllum söfnum"></div><button type="submit" class="btn btn-default"><i class="fa fa-search"></i></button></form>';
      return '<input type="text" ng-model="query" class="form-control" placeholder="{{placeholder}}">';

    },
    link : function ($scope, element, attrs, ngModel){

      $scope.placeholder = attrs.inputPlaceholder;


      var form = $(element).closest('form');
      var submit = (typeof $scope['onTypeaheadSubmit'] === 'function') ? $scope['onTypeaheadSubmit'] : function (){};


      $(form).on('submit', function (e){
        e.preventDefault();

        submit($scope.query);
        console.log('search', $scope.query);
        return false;
      })


      function updateScope (object, suggestion, dataset) {

        submit($scope.query);
        console.log(suggestion, object);
        // $scope.$apply(function () {
        //   var newViewValue = (angular.isDefined($scope.suggestionKey)) ?
        //       suggestion[$scope.suggestionKey] : suggestion;
        //   ngModel.$setViewValue(newViewValue);
        // });
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
