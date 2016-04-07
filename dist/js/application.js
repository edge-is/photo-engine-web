var search = angular.module('search', [
  'siyfion.sfTypeahead',
  'ui.bootstrap',
  'ngRoute',
  'nemLogging',
  'leaflet-directive',
  'cfp.hotkeys',
  'ui.select',
  'ngSanitize'
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

  $scope.TMPselectImg = function(img, res){
    var prefix = '';
    if (res == 'low'){
      prefix = 'medium';
    }else if ( res == 'high'){
      prefix = 'xx-large';
    }else {
      prefix = 'medium';
    }
    if(img._source.ImageWidth < img._source.ImageHeight){
      return 'img/scaled/'+prefix+'_uf-2.jpg';
    }else{
      return 'img/scaled/'+prefix+'_uf-1.jpg';
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
    if ( document.webkitIsFullScreen === false
      || document.mozFullScreen === false
      || document.msFullscreenElement === null) {
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
        return 'small';
      }else if(width >= 600 && width <= 900){
        return 'medium';
      }else if(width >= 900){
        return 'large';
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
        // var hits = response.data.hits.map(function (value, key){
        //   return TMPIMAGEOBJECT(value);
        // });

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

search.directive('lazyimg', function (){
  return {
    restrict: 'ACE',
    template : function (element, attr){
      console.log(attr.lowres);
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
  return {
      typeahead : function (query){

      },
      filter : function (filter){

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
