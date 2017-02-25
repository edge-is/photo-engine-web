function cdnImage(){
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
      var size = attr.size || 'x-small';

      console.log('CDN IMAGE');

      $scope.selectedImage = selectImage($scope.image);

      function selectImage(image){
        var cdnImage = image._source._thumbnails[size].name;
        return [config.cdn, '/thumbnails/', cdnImage].join('');
      }
    }
  };
}
