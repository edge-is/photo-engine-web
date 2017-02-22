
search.config([
  '$locationProvider',
  'uiSelectConfig',
  function ( $locationProvider, uiSelectConfig) {
  uiSelectConfig.theme = 'bootstrap';
  $locationProvider
    .html5Mode({
      enabled: true,
      requireBase: false,
      reloadOnSearch : true
    });
}]);
