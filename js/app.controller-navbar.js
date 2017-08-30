function controllerNavbar($scope){
  $scope.indices = config.indices;

  $scope.displaySearch = config.displaySearch || true;

  $scope.getLink = function(index, key){
    key = (key !== undefined) ? key : '';
    if (index.type === 'archive'){
      return "webarchive.html?index_id=" + key;
    }
    return "archives.html?index_id=" + key;
  }
}
