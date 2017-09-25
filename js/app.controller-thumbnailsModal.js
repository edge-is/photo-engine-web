function controllerThumbnailsModal($scope, $modalInstance, data){
  $scope.images = data.images;

  $scope.imageSize = "small";
  $scope.scrollDisabled = 'false';
  console.log(data);


  $scope.firstImg = data.images[0];

  $scope.close = function (index, image) {
    $modalInstance.close({index : index, image : image});
  };

  $scope.getName = function (image){

    return image._source.ObjectName.replace(/\_/g, ' ');
  }

  $scope.dismiss = function () {
    $modalInstance.dismiss();
  };

}
