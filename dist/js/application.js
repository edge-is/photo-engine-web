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

search.run( ['$rootScope', '$location', function ($rootScope, $location) {
  var allowModalsInControllers = ['imageLinked'];

  $rootScope.history = [];
  $rootScope.$on('$routeChangeSuccess', function(ev, data) {
    if (data.$$route){
      if (allowModalsInControllers.indexOf(data.$$route.controller) === -1){
        if($rootScope.modalInstance) {
          $rootScope.modalInstance.close();
        }
      }
    }
    $rootScope.history.push($location.$$path);
  });
}]);

function parseJSON(string){
  try {
    return JSON.parse(string);
  } catch (e) {
    return false;
  }
}

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


search.config([
  '$routeProvider',
  '$locationProvider',
  'uiSelectConfig',
  function ($routeProvider, $locationProvider,uiSelectConfig) {

  uiSelectConfig.theme = 'bootstrap';

  var initialized = false;
  $locationProvider
    .html5Mode({
      enabled: false,
      requireBase: false
    });
  $routeProvider
    .when('/', {
      controller : 'main',
      reloadOnSearch: false,
      templateUrl : 'views/main.html'
    })
    .when('/archives', {
      controller : 'archives',
      reloadOnSearch: false,
      templateUrl : 'views/archives.html'
    })
    .when('/archive/:archiveID', {
      controller : 'archive',
      reloadOnSearch: false,
      templateUrl : 'views/archive.html'
    })
    .when('/image/:imageID', {
      controller : 'imageLinked',
      reloadOnSearch: false,
      templateUrl : 'views/image.html'
    })
    .otherwise({
      controller : 'main',
      reloadOnSearch: false,
      templateUrl : 'views/main.html'
    });

}]);

search.controller('archive', [ '$scope', '$route', '$http', 'imageCache', '$window', '$timeout', '$location', 'utils',  controllerArchive]);


function controllerArchive($scope, $route, $http, imageCache, $window, $timeout, $location, utils){

  var archive_id = $route.current.params.archiveID;


  $scope.limit = 30;
  $scope.offset= 0;
  $scope.DefaultImage = 'small';
  $scope.archiveImages=[];
  $scope.scrollDisabled = true;
  $scope.loadedImages = 0;
  $scope.filters = {};
  $scope.queryString = "";
  $scope.showSidebar = true;
  $scope.displayResultCount = false;
  $scope.navSearch = "";

  $scope.archive = "";

  $scope.root = $window.location.hash.replace(/\#/g, '');

  // Set initial filter
  $scope.filters.archive_id = archive_id;
  $scope.searchTime = 0;


  var thisArchiveAggregateInfo = utils.createURI([ config.api, '/aggregates/archive'].join(''), {
    filter : 'archive_id:' + archive_id
  });
  // "http://localhost:3000/api/aggregates/archive?filter=archive_id:68b2ae89e6dc2807aec8008e20ba132c";

  $http.get(thisArchiveAggregateInfo).then(function (response){
    var results = response.data.data.results;

    if (results.length > 0){

      $scope.archive = results[0].name ;
    }
  });


  $scope.requestQuery = function (limit, offset, newSearch, callback){

    callback = callback || function (){};

    var filterStringArray = [];
    $scope.filterString = (function (filters){
      var arr = [];
      var string = "";

      for (var key in filters){
        var value = filters[key];
        arr.push([ key, value].join(':'));

      }

      string += arr.join(',');
      return string;
    })($scope.filters);


    $scope.filterString+=filterStringArray.join(',');


    if (!$scope.queryString){
      $scope.queryString = "";
    }

    if ($scope.queryString.length > 1){

      $location.search('query', $scope.queryString);
    }
    if ($scope.filters.length > 1){
      var uriFilter = angular.copy($scope.filters);
      delete uriFilter.archive_id;

      $location.search('filter', uriFilter);
    }

    var arciveAPI = [config.api, '/search/query?'].join('');

     var uri = utils.createURI(arciveAPI, {
       limit : limit,
       offset : offset,
       query : $scope.queryString,
       filter : $scope.filterString
     });


    $scope.scrollDisabled = true;

    $http.get(uri).then(function (response){
      if (newSearch){
        $scope.archiveImages=[];
      }

      $scope.displayResultCount = true;

      $scope.searchTime = response.data.data._took;
      response.data.data.hits.forEach(function (hit){
        $scope.archiveImages.push(hit);
      });

      $scope.loadedImages = $scope.archiveImages.length;
      $scope.availableImagesCount = response.data.data._total;

      if ($scope.loadedImages <= $scope.availableImagesCount ){
        $scope.scrollDisabled = false;
      }

    }, callback);
  }

  $scope.photographersapi = [config.api, '/aggregates/Credit'].join('');


  $scope.searchDelay = 300;

  $scope.searching = false;


  $scope.addToFilter = function (key, value){

    if ($scope.filters[key] === value){
      delete $scope.filters[key];
    }else if (!$scope.filters[key]){
      $scope.filters[key] = value;
    }else{
      delete $scope.filters[key];
      $scope.filters[key] = value;
    }
    $scope.requestQuery($scope.limit, 0, true);
  }
  $scope.submitNavSearch = function (){
    $scope.queryString = $scope.navSearch;
    $scope.requestQuery($scope.limit, 0, true);
  }

  $scope.setImagesInCache = function (index, image){
    imageCache.images = $scope.archiveImages;
    imageCache.image = image;
    imageCache.index = index;
  }

  $scope.load_more_data = function (callback){
    $scope.requestQuery($scope.limit, $scope.loadedImages, false, callback);
  }

  var url_query_string = $location.search().query;

  if (typeof url_query_string === 'string'){
    $scope.queryString = url_query_string;
    $scope.navSearch = url_query_string;
  }

  $scope.requestQuery($scope.limit, 0, false);


}

search.controller('archives', ['$scope', '$http',  archiveController]);


function archiveController($scope, $http){
  var url = [config.api, '/aggregates/archive'].join('');
  $scope.archives = [];


  $http.get(url).success(function (response){
    $scope.archives = response.data.results;
  });
}



search.controller('imageModalController', [
  '$scope',
  '$location',
  '$modalInstance',
  'data',
  'map',
  'hotkeys',
  '$rootScope',
  function ($scope, $location, $modalInstance, data, map, hotkeys, $rootScope) {
    $scope.index = data.index;
    $scope.images = data.results
    $scope.image = data.image;
    $scope.isFullscreen = false;
    $scope.fullscreenClass="no-fullscreen";
    $scope.root = data.root;

    $scope.currentLocation = $location.$$url;
    // console.log($location)
    $scope.close = function () {
      $modalInstance.close();
    };

    $scope.dismiss = function () {
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
        return '#/image/' + $scope.nextImg._id;
      }
    };

    $scope.prevURL = function (){
      if($scope.prevImg){
        return '#/image/' + $scope.prevImg._id;
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

    $rootScope.$on('$locationChangeStart', function (event, data){
      console.log(event, data);
    })

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

      // $scope.$apply();
    };

    function exitHandler(event){
      if (
           document.webkitIsFullScreen === false
        || document.mozFullScreen === false
        || document.msFullscreenElement === null ) {
          $scope.isFullscreen = false;
          $scope.fullscreenClass = 'no-fullscreen';
          console.log('EXIT?')
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

search.controller('imageLinked', [
  '$scope', '$route', 'imageService', '$uibModal', '$location', 'imageCache', '$window', '$rootScope', '$location',
  function ($scope, $route, imageService, $uibModal, $location, imageCache, $window, $rootScope, $location){

    if(imageCache.loaded) return;

    var root = $location.search().root || '/';

    $scope.lastURI = $rootScope.history[$rootScope.history.length - 2];

    $scope.imageID = $route.current.params.imageID;

    if (!imageCache.index && imageCache.index !== 0){
      function selectData(response){
        return response.data[0][0];
      }
      imageService.getImageByID($scope.imageID).then(function (response){
        if(response.data){
          var img = selectData(response.data);
          openModal(0, img, []);
        }
      });
    }else{
      openModal(imageCache.index, imageCache.image, imageCache.images);
      imageCache.loaded =true;
    }

  function openModal(index, image, results) {

     var modalInstance = $uibModal.open({
       templateUrl: 'views/image-modal.html',
       controller: 'imageModalController',
       size: 'lg',
       animation: false,
       resolve: {
         data : function () {
           return {
             root : root,
             index : index,
             image : image,
             results : results
           }
         }
       }
     });

     $rootScope.modalInstance = modalInstance;

     modalInstance.result.then(function (data) {

       //successful close,
       imageCache.loaded =false;
        var lastUri = root;

        console.log(lastUri);
        //$window.history.back();
        //What was the last url????
        $location.url(lastUri);
     }, function () {
       // close but dont change URI
       imageCache.loaded = false;

     });
   };



}]);

search.controller('main',
[
  '$scope',
  '$window',
  '_search',
  '$uibModal',
  '$log',
  '$location',
  'imageCache',
 function ($scope, $window, _search, $uibModal, $log, $location, imageCache){
   console.log(
     'what the fuck',
     angular.element('#mainsearch').attr("sf-typeahead")
    )
    $scope.photographersapi = [config.api, '/aggregates/Credit'].join('');


    //
    // document.getElementById("mainsearch")[0]
    $scope.MainSearchHidden = true;
    $scope.MainSearch='';
    $scope.StartSearch='';
    $scope.typeaheadquery = '';
    $scope.searchTime = 0;
    $scope.searchResultsTotal = 0;
    $scope.mainSearchHits =  [];

    $scope.displayResultCount = false;

    $scope.scrollDisabled = false;
    $scope.mainSearchOptions = {
      limit : 30,
      offset : 0
    };

    //sf-typeahead

    var TypeaheadEngine = new Bloodhound({
      datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.num); },
      queryTokenizer:  Bloodhound.tokenizers.whitespace,
      remote : {
        url : config.api + '/search/typeahead?query={query}*',
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

    if($scope.mainSearchQuery !== '' || $scope.mainSearchFilter !== ''){
      //Fore some reson need to set input value async..
      setTimeout(function (){
        $scope.MainSearch = $scope.mainSearchQuery;
        $scope.$apply();
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

    $scope.DefaultImage = "x-small";

    function mainSearch(query, type, filter){

      type = type || 'query';

      // Allow for a advanced search also

      angular.element('#mainsearch').focus();
      $scope.MainSearchHidden=false;
      $scope.StartSearchHidden=true;

      angular.element('body')[0].scrollTop = 0;

      _search.query($scope.mainSearchQuery, $scope.mainSearchOptions).then( function (response){
        $scope.displayResultCount = true;
        $scope.searchTime = response.data._took;
        $scope.searchResultsTotal = response.data._total;
        $scope.mainSearchHits = response.data.hits;

        $scope.submittedQuery = $scope.mainSearchQuery;


        //return console.log(response.data);
        $scope.mainSearchSize = response.data.hits.length;
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
        $scope.mainSearchSize += response.data.hits.length;
        callback();
      });
    };


    $scope.openImage = function (index, image, results) {
      imageCache.image = image;
      imageCache.index = index;
      imageCache.images = results;

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

search.directive('backgroundImage', [directiveBackgroundImage]);


function directiveBackgroundImage(){
  return {
    restrict : 'ACE',
    link : function(scope, element, attrs){
      var url = [ 'url(', attrs.backgroundImage, ')'].join('');
      element.css({
          'background-image': url
      });
    }
  };
}

search.directive('filterList', ['$http', 'utils', directiveFilterList]);



function directiveFilterList ($http, utils){
  return {
    restrict : 'ACE',
    template : function (element, attrs){


      var credit_raw = "'" + attrs.filterKey + "'";

      return '<li ng-repeat="item in ' + attrs.dataset + '"><a href ng-click="addToFilter('+credit_raw+', item.name)"><input ng-checked="filters['+credit_raw+'] === item.name" type="checkbox"> {{item.name}} <span class="pull-right">{{item.count}}</span></a></li>';
    },
    link : function ($scope, element, attrs, ngModel){
      var api = attrs.api;

      console.log(attrs);

      function getQuery(){
        return $scope[attrs.query];
      }
      function getFilter(){
        return $scope[attrs.filter];
      }


      if (attrs.filter){

        $scope.$watch(attrs.filter, function (_new, _old){
          update(getQuery(), getFilter());
        });
      }

      if (attrs.query){

        $scope.$watch(attrs.query, function (_new, _old){
          update(getQuery(), getFilter());
        });
      }

      function update(query, filter){
        var queryParams = {};

        queryParams.filter = filter || false;

        queryParams.query = query || false;
        var uri = utils.createURI(api, queryParams);

        if (uri === '?') return;

        $http.get(uri).then(function (response){
          $scope[attrs.dataset] = response.data.data.results;
        })

      }
      update();
    }
  }
}

search.directive('lazyimg', ['$timeout', directiveLazyImage]);


function directiveLazyImage($timeout){
  return {
    restrict: 'ACE',
    template : function (element, attr){
      return '<img class="low-resolution-image" ng-src="' + attr.lowres + '"></img><img class="hidden high-resolution-image" ng-src="' + attr.highres + '"></img>';
    },
    link : function (scope, element, attr){
      $('.high-resolution-image').bind('load', function (){

        $('.low-resolution-image').addClass('hidden');
        scope.$apply();
        $timeout(function (){
          $('.high-resolution-image')
             .removeClass('hidden').unbind('load');
        }, 10)


        $('.low-resolution-image').remove();
      });
    }
  };
}

search.directive('typeaheadsearch', typeaheadDirective);

function typeaheadDirective(){
  return {
    restrict : 'ACE',
    scope : {
      enabled: "&MainSearchHidden"
    },

    transclude : true,
    // template : function (elem, attrs, sc){
    //   console.log(elem, attrs, sc);
    //   if(attrs.enabled === "") return "";
    //   return "HELLO";
    //   return '<form class="navbar-main-search navbar-form" ng-hide="(MainSearchHidden)" role="search"><div class="form-group"><input type="text" ng-focus="false" id="mainsearch" sf-typeahead options="TypeaheadOptions" datasets="TypeaheadEngineData" ng-model="MainSearch" class="form-control nav-search typeahead" placeholder="Search"></div><button type="submit" class="btn btn-default submit-search" ng-click="submitMainSearch()">Search</button><a href="#/advancedsearch.html" type="submit" class="btn btn-default a-nograyscale hidden-xs" ng-click="openAdvancedSearch()">Advanced</a></form>';
    // },
    link : function (scope, elem, attrs){
      console.log(elem, scope, attrs);
      return 'HELLO';
    }
    //template : ,
  }

};

search.directive('randomArchiveImage', ['$http','$compile',  directiveRandomArchiveImage] );

function directiveRandomArchiveImage($http, $compile){
  return {
    restrict : 'ACE',
    template : function (elem, attrs){
      return '<div class="carousel slide archives-carousel" data-ride="carousel"><div class="carousel-inner" role="listbox"><div class="item active"><div class="background-thumbnail"></div><div class="carousel-caption"><h5>{{archive_name}}</h5></div></div></div></div>';
      //return '<div class="background-thumbnail"></div>';

    },
    replace : true,
    link : function ($scope, element, attrs){
      $scope.availableImages=[];
      $scope.archive_name = attrs.archiveName;
      $scope.image_name = "";
      var url = [config.api, '/random/archives?archive_id=', attrs.archive  ].join('')
      $http.get(url).success(function (response){
        $scope.availableImages = response.data.hits;
        var selected = response.data.hits.pop();

        $scope.image_name = selected._id;
        $scope.selectedArchiveImage = selected._source.cdn1.small;
        element.attr('background-image', $scope.selectedArchiveImage);
        $compile(element)($scope);
      });
    },
  }
}



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
      console.log($scope, ngModel, attrs);

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



search.factory('imageCache', factorySharedImages);
function factorySharedImages(){
    return {
      startUrl : "/",
      index : null,
      image :null,
      images : [],
      loaded : false
    };
}

search.filter('ms', [function (){
  return function (ms){
    var seconds = ms / 1000;

    if (isNaN(seconds)) return "";

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


function serviceImage($http){
  return {
    getImageByID : function (id){
        var url = [config.api, '/image/', id].join('');
        return $http.get(url);
    }
  }

}

search.service('imageService', ['$http', serviceImage]);

search.service('suggester', ['$http', serviceSuggester]);

function serviceSuggester($http){
  return function (query, filters, options){
    options = options || {};
    var apiURL = [config.api, '/search/suggest?'].join('');

    var url = options.url || apiURL;

    var uri = [url, 'filter=', filters, '&query=', query].join('');

    return $http.get(uri);
  };
}

search.service('utils', serviceUtils);

function serviceUtils(){
  return {
    createURI : function (url, queryParams){

      var queryParamsArray = [];
      for (var key in queryParams ){
        var value = queryParams[key];

        if (!value) continue;

        queryParamsArray.push([key, value].join('='));
      }

      var queryString = queryParamsArray.join('&');


      return [url, queryString].join('?');
    },
    each : function (collection, callback){

      (function (collection, callback){
        for (var key in collection){
          callback(key, collection[key]);
        }
      })(collection, callback);
    }
  }
}

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
