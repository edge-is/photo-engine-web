var search = angular.module('search', [
  'siyfion.sfTypeahead',
  'ui.bootstrap',
  'ngRoute',
  'nemLogging',
  'leaflet-directive',
  'cfp.hotkeys',
  'ui.select',
  'ngSanitize',
  'angularScroll'
]);

search.config([
  '$routeProvider',
  '$locationProvider',
  'uiSelectConfig',
  function ($routeProvider, $locationProvider,uiSelectConfig) {

  uiSelectConfig.theme = 'bootstrap';
  $locationProvider
    .html5Mode({
      enabled: true,
      requireBase: false
    });
}]);


var settings = {
  search: {
    fields : {
      "BitsPerSample": {
        "type": "long"
      },
      "CaptionWriter": {
        "type": "string"
      },
      "Category": {
        "type": "string"
      },
      "City": {
        "type": "string"
      },
      "ColorComponents": {
        "type": "long"
      },
      "ColorMode": {
        "type": "string"
      },
      "Comment": {
        "type": "string"
      },
      "Country": {
        "type": "string"
      },
      "Credit": {
        "type": "string"
      },
      "DateCreated": {
        "type": "date"
      },
      "Description": {
        "type": "string"
      },
      "Directory": {
        "type": "string"
      },
      "ExifImageHeight": {
        "type": "long"
      },
      "ExifImageWidth": {
        "type": "long"
      },
      "FileName": {
        "type": "string"
      },
      "FileType": {
        "type": "string"
      },
      "ImageHeight": {
        "type": "long"
      },
      "ImageWidth": {
        "type": "long"
      },
      "Instructions": {
        "type": "string"
      },
      "Keywords": {
        "type": "string"
      },
      "LocalCaption": {
        "type": "string"
      },
      "MIMEType": {
        "type": "string"
      },
      "ObjectName": {
        "type": "string"
      },
      "Orientation": {
        "type": "string"
      },
      "PhotometricInterpretation": {
        "type": "string"
      },
      "ProfileFileSignature": {
        "type": "string"
      },
      "ReleaseDate": {
        "type": "date"
      },
      "Rights": {
        "type": "string"
      },
      "Source": {
        "type": "string"
      },
      "SourceFile": {
        "type": "string"
      },
      "SpecialInstructions": {
        "type": "string"
      },
      "State": {
        "type": "string"
      },
      "Subject": {
        "type": "array"
      },
      "SupplementalCategories": {
        "type": "array"
      },
      "Title": {
        "type": "string"
      },
      "XResolution": {
        "type": "long"
      },
      "YResolution": {
        "type": "long"
      },
      "safn": {
        "type": "string"
      }
    }
  }
};

search.directive('backgroundImage', [ function (){
  return {
    restrict : 'ACE',
    link : function(scope, element, attrs){
      var url = [ 'url(', attrs.backgroundImage, ')'].join('');
      element.css({
          'background-image': url
      });
    }
  };
}]);

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
      $modalInstance.close({ query:$scope.advanced_search_query});
    };

    $scope.close = function () {
      $modalInstance.dismiss();
    };

  }]);



search.controller('ImageController', [
  '$scope',
  '$location',
  '$modalInstance',
  'data',
  'map',
  'hotkeys',
  function ($scope, $location, $modalInstance, data, map, hotkeys) {
    $scope.index = data.index;
    $scope.images = data.results
    $scope.image = data.image;
    $scope.isFullscreen = false;
    $scope.fullscreenClass="no-fullscreen";
    $scope.close = function () {
      $modalInstance.dismiss();
    };
    $scope.nextImg = $scope.images[$scope.index + 1];
    $scope.prevImg = $scope.images[$scope.index - 1];

    $scope.next = function (){
      if(($scope.index + 1) < $scope.images.length ){
        $scope.StopLazy();
        $scope.index = $scope.index + 1;
        $scope.image = $scope.images[$scope.index];
        $scope.nextImg = $scope.images[$scope.index];
      }
    };

    $scope.prev = function (){
      if($scope.index > 0){
        $scope.StopLazy();
        $scope.index = $scope.index - 1;
        $scope.image = $scope.images[$scope.index];
        $scope.prevImg = $scope.images[$scope.index];
      }
    };

    $scope.nextURL = function (){
      if( $scope.nextImg ){
        return '/image/' + $scope.nextImg._id;
      }
    };

    $scope.prevURL = function (){
      if($scope.prevImg){
        return '/image/' + $scope.prevImg._id;
      }
    };

    $scope.isNext = function (){
      var len = $scope.images.length;
      if(($scope.index + 1) >= len) {
        return false;
      }else{
        return true;
      }
    };

    $scope.isPrev = function (){
      if($scope.index == 0) {
        return false;
      }else{
        return true;
      }
    };

    $scope.landscape = function (img){
      if(img._source.ImageWidth < img._source.ImageHeight){
        return false;
      }else{
        return true;
      }
    };

    $scope.StopLazy = function (){
      $('.high-resolution-image').unbind('load');
    };

    var fullscreens = 'webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange';

    $(document).on(fullscreens, exitHandler);

    $scope.fullscreen = function (){
      var i = document.getElementById("preview_carousel");
      if (i.requestFullscreen) {
      	i.requestFullscreen();
        //listenForFullScreenChange();
      } else if (i.webkitRequestFullscreen) {
      	i.webkitRequestFullscreen();
        //listenForFullScreenChange();
      } else if (i.mozRequestFullScreen) {
      	i.mozRequestFullScreen();
        //listenForFullScreenChange();
      } else if (i.msRequestFullscreen) {
      	i.msRequestFullscreen();
        //listenForFullScreenChange();
      }
      $scope.fullscreenClass = 'fullscreen';
      $scope.isFullscreen = true;
    };

    function exitHandler(event){
      if (
           document.webkitIsFullScreen === false
        || document.mozFullScreen === false
        || document.msFullscreenElement === null ) {
          $scope.isFullscreen = false;
          $scope.fullscreenClass = 'no-fullscreen';
        }
    }


  hotkeys.bindTo($scope)
    .add({
      combo: 'right',
      description: 'Select next image.',
      callback: function() {
        $scope.next();
      }
    })
    .add({
      combo: 'left',
      description: 'Select prev image',
      callback: function() {
        $scope.prev();
      }
    })

    $scope.center = {};

    $scope.defaults = { scrollWheelZoom: false };
    $scope.mapmarker = {};

    $scope.Map = function (){
      $scope.MapLoaded = false;
      var osmParams = {};
      var SearchOSM=false;
      if ('City' in $scope.image._source){
        SearchOSM=true;
        osmParams.city = $scope.image._source.City;
      }else if('State' in $scope.image._source){
        SearchOSM=true;
        osmParams.state = $scope.image._source.State;
      }
      if('Country' in $scope.image._source){
        if($scope.image._source.Country.split(' ').length <= 2){
          osmParams.Country = $scope.image._source.Country;
        }
      }

      /** FIXME: Move to special controller **/
      if(SearchOSM == true){
        map.osm(osmParams).then(function (d){
          if(d.length > 0){
            $scope.MapLoaded = true;
            //angular.extend($scope, )
            $scope.center = {
              lat : +d[0].lat,
              lng : +d[0].lon,
              zoom : 4
            };
            $scope.mapmarker = {
              m1 : {
                lat : +d[0].lat,
                lng : +d[0].lon,
                message : 'Wazzuuup?',
                icon: 'img/map-marker.png'
              }
            };
          }
        });
      };
  }
}]);

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

search.directive('lazyimg', function (){
  return {
    restrict: 'ACE',
    template : function (element, attr){
      return '<img class="low-resolution-image" ng-src="' + attr.lowres + '"></img><img class="hidden high-resolution-image" ng-src="' + attr.highres + '"></img>';
    },
    link : function (scope, element, attr){
      $('.high-resolution-image').bind('load', function (){

        $('.low-resolution-image').addClass('hidden');
        $('.high-resolution-image')
           .removeClass('hidden').unbind('load');
      });
    }
  };
});

search.filter('ms', [function (){
  return function (ms){
    var seconds = ms / 1000;

    return seconds + 's';
  };
}]);



search.filter('propsFilter', function() {
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
});

search.service('_search',
[
  '$http',
  '$q',
  function ($http, $q){
  function post(url, data){
    return $http.post(url, data);
  };
  function get(url){
    return $http.get(url);
  };

  return {
      typeahead : function (query){

      },
      filter : function (filter){

      },
      advancedSearch : function (queryObject, options){
        if(!options){
          options = {};
        }
        var limit = options.limit || 30;
        var offset = options.offset || 0;
        var deferred = $q.defer();
        var url = [config.api,'/search/advanced?'].join('');
        url += 'limit=' + limit;
        url += '&offset=' + offset;

        return post(url, queryObject);
      },
      query : function (query, options){
        if(!options){
          options = {};
        }
        var limit = options.limit || 30;
        var offset = options.offset || 0;
        var deferred = $q.defer();
        var url = [config.api,'/search/query?'].join('');
        url += 'limit=' + limit;
        url += '&offset=' + offset;
        url += '&query=' + query;
        $http.get(url).success(function(data){
          deferred.resolve(data);
      	}).error(function(data){
          deferred.reject(data);
        });
        return deferred.promise;
      }
    }
  }
]);


search.service('map', [
  '$http',
  '$q',
  function ($http, $q){
    return {
      osm : function (query){
        var deferred = $q.defer();
        var params = {
          url : "https://nominatim.openstreetmap.org/search.php",
          method : 'GET',
          params : query
        };
        params.params.format = 'json';
        $http(params).success(function(data){
          deferred.resolve(data);
      	}).error(function(data){
          deferred.reject(data);
        });
        return deferred.promise;
      }
    }

}]);

search.service('translate', [ function (){
  return function (text){
    if (('lang' in window) === false){
      return { name : text};
    }
    if (text in lang){
      var translated = lang[text];
      if (translated.name !== ""){
        return translated;
      }else{
        return { name : text};
      }
    }else{
      return { name : text};
    }
  };
}]);
