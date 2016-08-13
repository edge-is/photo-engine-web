
search.config([
  '$routeProvider',
  '$locationProvider',
  'uiSelectConfig',
  function ($routeProvider, $locationProvider, uiSelectConfig) {

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
