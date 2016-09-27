

function typeaheadDirective(photoApi, $rootScope){
  return {
    restrict : 'ACE',
    replace : true,
    scope : {
      query : "=?",
      onTypeaheadSubmit : "=?",
      filter : "=?"
    },
    template : function (element, attrs){
      return '<input type="text" ng-model="query" class="form-control" placeholder="{{placeholder}}">';
    },
    link : function ($scope, element, attrs){

      $scope.placeholder = attrs.inputPlaceholder;

      $scope.filter = $scope.filter || false;

      console.log($scope);
      $scope.query = $scope.query || "";

      var form = $(element).closest('form');
      var submit = (typeof $scope['onTypeaheadSubmit'] === 'function') ? $scope['onTypeaheadSubmit'] : function (){};

      setTimeout(function (){
        console.log('typeaheadDirective', $scope);
      }, 1000);
      $(form).on('submit', function (e){
        e.preventDefault();
        submit($scope.query);
        return false;
      });

      $scope.$watch('query', function (_new, _old){
        console.log('WATH QUERY')
        $rootScope.$emit('queryUpdate', _new, _old);
      })

      function updateScope (object, suggestion, dataset) {
        submit(suggestion);
      }

      function removeDupes(hits, key){
        var cache = {};

        return hits.filter(function (item){
          var hit = item[key];
          if (cache[hit]){
            return false;
          }
          cache[hit] = true;

          return true;

        });


      }

      function orderBy(key){
        return function (a,b){
          if (a[key] < b[key]){
            return -1;
          }
          if (a[key] > b[key]){
            return 1;
          }
          return 0;

        }
      }


      function hitMe(response){
        var arr = [];
        for (var key in response.suggest){
          var suggest = response.suggest[key];
          var items = suggest.pop().options;
          items.forEach(function (item){
            arr.push(item);
          });
        }

        var ordered = arr.sort(orderBy('score')).reverse();

        return removeDupes(ordered, 'text');
      }
      function elasticsearchSuggester(){
        return function (query, syncCallback, asyncCallback){
          /** FIXME: Need to add filter here!!! **/
          photoApi.suggest({ query : query }).then(function(response){
            var h = hitMe(response.data.data);

            var parsedHits = h.map(function (item){
              return item.text;
            });

            asyncCallback(parsedHits);
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
