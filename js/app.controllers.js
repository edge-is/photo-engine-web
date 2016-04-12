search.controller('main',
[
  '$scope',
  '$window',
  '_search',
  '$uibModal',
  '$log',
  '$location',
 function ($scope, $window, _search, $uibModal, $log, $location){
    $scope.MainSearchHidden = true;
    $scope.MainSearch='';
    $scope.StartSearch='';
    $scope.typeaheadquery = '';
    $scope.searchTime = 0;
    $scope.searchResultsTotal = 0;
    $scope.mainSearchHits =  [];

    $scope.scrollDisabled = false;
    $scope.mainSearchOptions = {
      limit : 30,
      offset : 0
    };

    var TypeaheadEngine = new Bloodhound({
      datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.num); },
      queryTokenizer:  Bloodhound.tokenizers.whitespace,
      remote : {
        url : 'http://localhost:3000/api/search/typeahead?query={query}*',
        wildcard: '{query}',
        filter: function (data) {
           return data.data.hits;
       }
      }
    });

    /* To flush cache*/
    TypeaheadEngine.clear();

    TypeaheadEngine.initialize();
    $scope.TypeaheadEngineData = {
      displayKey: 'hit',
      source: TypeaheadEngine.ttAdapter()
    };

    // Typeahead options object
    $scope.TypeaheadOptions = {
      highlight: true
    };

    $scope.mainSearchQuery = $location.search().query || '';
    $scope.mainSearchFilter = $location.search().filter || '';

    // $scope.MainSearchHidden=false;
    // $scope.StartSearchHidden=true;

    if($scope.mainSearchQuery !== '' || $scope.mainSearchFilter !== ''){
      //Fore some reson need to set input value async..
      setTimeout(function (){
        $scope.MainSearch = $scope.mainSearchQuery;
      }, 100)
      mainSearch($scope.mainSearchQuery);
    }

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

    $scope.submitMainSearch = function (){
      if($scope.MainSearch.hit){
        $scope.mainSearchQuery = $scope.MainSearch.hit;
      }else{
        $scope.mainSearchQuery = $scope.MainSearch;
      }

      $scope.setURI();
      mainSearch($scope.mainSearchQuery);
    };

    $scope.setURI = function (){
      var url = {};
      if($scope.mainSearchQuery !== ''){
        url.query = $scope.mainSearchQuery;
      }
      if($scope.mainSearchFilter !== ''){
        url.filter = $scope.mainSearchFilter;
      }
      $location.search(url);
    };

    $scope.$on('typeahead:selected', function (object, suggestion, dataset){
      if($scope.MainSearch.hit){
        $scope.mainSearchQuery = $scope.MainSearch.hit;
      }else{
        $scope.mainSearchQuery = $scope.MainSearch;
      }
      $scope.setURI();
      mainSearch($scope.mainSearchQuery);
    });

    $scope.landscape = function (img){
      if(img._source.ImageWidth < img._source.ImageHeight){
        return false;
      }else{
        return true;
      }
    };

    var w = angular.element($window);
    $scope.windowWidth = w.width();

    $scope.DefaultImage = rightImg($scope.windowWidth);

    function rightImg(width){
      if (width < 400){
        return 'small';
      }else if(width >= 600 && width <= 900){
        return 'medium';
      }else if(width >= 900){
        return 'large';
      }
    };



    function mainSearch(query, type, filter){

      type = type || 'query';

      // Allow for a advanced search also

      angular.element('#mainsearch').focus();
      $scope.MainSearchHidden=false;
      $scope.StartSearchHidden=true;

      angular.element('body')[0].scrollTop = 0;

      _search.query($scope.mainSearchQuery, $scope.mainSearchOptions).then( function (response){
        $scope.searchTime = response.data._took;
        $scope.searchResultsTotal = response.data._total;
        $scope.mainSearchHits = response.data.hits;

        $scope.submittedQuery = $scope.mainSearchQuery;


        //return console.log(response.data);
        $scope.mainSearchSize = response.data.hits.length;


        console.log($scope.mainSearchSize);
      });

      $scope.lastSearchURI = $location.$$url;
    }


    $scope.load_more_data = function (callback){
      if ($scope.mainSearchSize < 1){
        return;
      }
      var options = {
        limit : $scope.mainSearchOptions.limit,
        offset : $scope.mainSearchSize
      };
      _search.query($scope.submittedQuery, options).then( function (response){
        if (!response) return;

        if (response.data.hits.length < 1){
          return;
        }
        $scope.searchTime = response.data._took;
        $scope.searchResultsTotal = response.data._total;

        // $scope.mainSearchHits.concat(response.data.hits);
        response.data.hits.forEach(function (item){
          $scope.mainSearchHits.push(item);
        });

        //$scope.$apply();


        //return console.log(response.data);
        $scope.mainSearchSize += response.data.hits.length;


        callback();
      });
    };


    $scope.openImage = function (index, image, results) {
       var modalInstance = $uibModal.open({
         templateUrl: 'views/image-modal.html',
         controller: 'ImageController',
         size: 'lg',
         resolve: {
           data : function () {
             return {
               index : index,
               image : image,
               results : results
             }
           }
         }
       });
       modalInstance.result.then(function (data) {
       }, function () {
         $location.url($scope.lastSearchURI);
       });
     };
     $scope.openAdvancedSearch = function (index, image, results) {
        var modalInstance = $uibModal.open({
          templateUrl: 'views/advanced-search-modal.html',
          controller: 'AdvancedSearchController',
          size: 'lg',
          resolve: {
            data : function () {
              return { };
            }
          }
        });
        modalInstance.result.then(function (data) {
          var request = _search.advancedSearch(data, {});

          request.success(function (response){
            console.log(response);
          })

          // Do query
        }, function () {
          // dismiss ?
          $location.url($scope.lastSearchURI);
        });
      };
  }
]);
