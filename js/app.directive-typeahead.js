

function navbarTypeaheadDirective(elasticsearch, $rootScope, utils){
  return {
    restrict : 'ACE',
    replace : true,
    scope : {
      query : "=?",
    },
    template : function (element, attrs){
      return '<form class="navbar-form navbar-right"  ng-cloak><div class="form-group" ><input type="text" ng-model="query" class="form-control typeahead-input" placeholder="{{placeholder}}"> <button ng-click="submit()" name="submit" type="submit" class="btn btn-default"><i class="fa fa-search"></i></button></div></form>';
    },
    link : function ($scope, element, attrs){

      $scope.placeholder = attrs.inputPlaceholder;

      $scope.query = $scope.query || "";

      $scope.index = $rootScope.currentIndex.index.index;
      $scope.type = $rootScope.currentIndex.index.type;

      var element = $(element).find('.typeahead-input');

      $scope.submit = function (q){
        console.log('Q', $scope.query)

        q = q || $scope.query;

        $scope.search(q);
      }

      $scope.search = function (queryString){
        var query = bodybuilder().query('query_string', 'query', queryString).build();

        var base64Query = utils.base64encode(query);

        window.location = '/search_index.html?query=' + base64Query;

      }

      function updateScope (object, suggestion, dataset) {
        $scope.submit(suggestion);
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

      var availableFields = [
         {field : 'Description' , min_word_length: 1, suggest_mode: 'popular', confidence:0.9 },
         {field : 'UserDefined3', min_word_length: 1, suggest_mode: 'popular', confidence:0.5 },
         {field : 'Credit'      , min_word_length: 1, suggest_mode: 'popular', confidence:0.4 },
         {field : 'LocalCaption', min_word_length: 1, suggest_mode: 'popular', confidence:0.4 },
         {field : 'Category'    , min_word_length: 1, suggest_mode: 'popular', confidence:0.3 },
       ];


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
        return function (queryString, syncCallback, asyncCallback){

          var query = bodybuilder();

          var suggest = {};

          availableFields.forEach(function (item){
            suggest[item.field] = {
              phrase: {
                field: item.field,
                gram_size: 10,
                direct_generator : [ {
                   field :            item.field,
                   suggest_mode :     item.suggest_mode,
                   min_word_length :  item.min_word_length
                 } ],
              }
            }

          });
          suggest.text = queryString;

          query.rawOption('suggest', suggest);

          query.size(0);

          elasticsearch.search({
            index : $scope.index,
            type : $scope.type,
            body : query
          }, function (err, res){
            console.log(err, res);

            if (!res.suggest) {
              asyncCallback([]);
              return console.log('Could not suggest');
            }

            var hits = getAllSuggestHits(res);
            var arr = hits.map(function (item){
              return item.text;
            });
            asyncCallback(arr);
          });
        };
      }

      function getAllSuggestHits(res){
        var querys = Object.keys(res.suggest);

        var hits = [];

        querys.forEach(function (key){

          var first = res.suggest[key].pop();

          first.options.forEach(function (hit){
            hits.push(hit);
          });

        });
        var ordered = hits.sort(orderBy('score')).reverse();
        return removeDupes(ordered, 'text');
      }

      $(element).typeahead({
        hint: true,
        highlight: false,
        minLength: 3,
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
