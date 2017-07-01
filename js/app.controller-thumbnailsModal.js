function controllerThumbnailsModal($scope, $modalInstance, data){
  $scope.images = data.images;

  $scope.imageSize = "small";
  $scope.scrollDisabled = 'false';
  console.log(data);
  $scope.close = function (index, image) {
    $modalInstance.close({index : index, image : image});
  };

  $scope.dismiss = function () {
    $modalInstance.dismiss();
  };

  $scope.selectThumbnail = function (image){
    var imageToUse = image._source._thumbnails[$scope.imageSize];
    return [config.cdn, 'thumbnails', imageToUse.name].join('/');
  };
}
