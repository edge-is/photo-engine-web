function cdnImage(cdn){
  return {
    restrict: 'ACE',
    scope : {
      image : "="
    },
    replace: true,
    template : function (element, attr){
      return '<img ng-src="{{selectedImage}}"/>';
    },
    link : function ($scope, element, attr){

      var cache  = (attr.cache === 'false') ? false : true;
      $scope.selectedImage = cdn.thumbnail($scope.image._source, attr.size, cache)
    }
  };
}
