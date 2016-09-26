
search.config([
  '$locationProvider',
  'uiSelectConfig',
  function ( $locationProvider, uiSelectConfig) {
    // $(window).on("navigate", function (event, data) {
    //   var direction = data.state.direction;
    //   if (direction == 'back') {
    //     // do something
    //   }
    //   if (direction == 'forward') {
    //     // do something else
    //   }
    // });
  uiSelectConfig.theme = 'bootstrap';
  $locationProvider
    .html5Mode({
      enabled: true,
      requireBase: false,
      reloadOnSearch : true
    });
}]);
