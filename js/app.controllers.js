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
    $scope.MainSearchHits =  [
      // { id : '2', landscape : false, orentation : 'portrait', src : 'img/scaled/medium_uf-2.jpg' },
      // { id : '1', landscape : true, orentation : 'landscape', src : 'img/scaled/medium_uf-1.jpg' },
      // { id : '3', landscape : false, orentation : 'portrait', src : 'img/scaled/medium_uf-2.jpg' },
      // { id : '5', landscape : true, orentation : 'landscape', src : 'img/scaled/medium_uf-1.jpg' },
      // { id : '4', landscape : false, orentation : 'portrait', src : 'img/scaled/medium_uf-2.jpg' },
      // { id : '6', landscape : false, orentation : 'portrait', src : 'img/scaled/medium_uf-2.jpg' },
      // { id : '7', landscape : true, orentation : 'landscape', src : 'img/scaled/medium_uf-1.jpg' },
      // { id : '8', landscape : true, orentation : 'landscape', src : 'img/scaled/medium_uf-1.jpg' }
    ];

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

    $scope.MainSearchQuery = $location.search().query || '';
    $scope.MainSearchFilter = $location.search().filter || '';

    // $scope.MainSearchHidden=false;
    // $scope.StartSearchHidden=true;

    if($scope.MainSearchQuery !== '' || $scope.MainSearchFilter !== ''){
      //Fore some reson need to set input value async..
      setTimeout(function (){
        $scope.MainSearch = $scope.MainSearchQuery;
      }, 100)
      MainSearch($scope.MainSearchQuery);
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
        $scope.MainSearchQuery = $scope.MainSearch.hit;
      }else{
        $scope.MainSearchQuery = $scope.MainSearch;
      }

      $scope.setURI();
      MainSearch($scope.MainSearchQuery);
    };

    $scope.setURI = function (){
      var url = {};
      if($scope.MainSearchQuery !== ''){
        url.query = $scope.MainSearchQuery;
      }
      if($scope.MainSearchFilter !== ''){
        url.filter = $scope.MainSearchFilter;
      }
      $location.search(url);
    };

    $scope.$on('typeahead:selected', function (object, suggestion, dataset){
      if($scope.MainSearch.hit){
        $scope.MainSearchQuery = $scope.MainSearch.hit;
      }else{
        $scope.MainSearchQuery = $scope.MainSearch;
      }
      $scope.setURI();
      MainSearch($scope.MainSearchQuery);
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

    $scope.DefaultImage = RightImg($scope.windowWidth);

    function RightImg(width){
      if (width < 400){
        return 's';
      }else if(width >= 600 && width <= 900){
        return 'm';
      }else if(width >= 900){
        return 'l';
      }
    };

    function TMPIMAGEOBJECT (src){
        var path = '_uf-1.jpg';
        if (!$scope.landscape(src)){
          path = '_uf-2.jpg';
        }
        src._source.imagesrc = {
          'xs'  : window.location.origin+'/img/scaled/xx-small'+path,
          's'   : window.location.origin+'/img/scaled/small'+path,
          'm'   : window.location.origin+'/img/scaled/medium'+path,
          'l'   : window.location.origin+'/img/scaled/large'+path,
          'xl'  : window.location.origin+'/img/scaled/x-large'+path,
          'xxl' : window.location.origin+'/img/scaled/xx-large'+path
        };
        return src;
    }

    function MainSearch(query, filter){
      angular.element('#mainsearch').focus();
      $scope.MainSearchHidden=false;
      $scope.StartSearchHidden=true;

      angular.element('body')[0].scrollTop = 0;

      _search.query($scope.MainSearchQuery, {}).then( function (response){
        var hits = response.data.hits.map(function (value, key){
          return TMPIMAGEOBJECT(value);
        });

        $scope.searchTime = response.data._took;
        $scope.searchResultsTotal = response.data._total;
        $scope.MainSearchHits = response.data.hits;
      });

      $scope.lastSearchURI = $location.$$url;
    }


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
          // Do query
        }, function () {
          // dismiss ?
          $location.url($scope.lastSearchURI);
        });
      };
  }
]);
