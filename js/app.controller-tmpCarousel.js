/**
 * Controller for Archive Listing
 */

function archiveImageCarousel($scope, $http){

  $scope.images = [];
  $http.get('./temp-exif.json').success(function (response){
    var images = response.map(function (item){
      item.displayimage = getLocation(item.ObjectName);
      return item;
    });

    console.log(images);
    $scope.images = images;
  });

  $scope.isFirst= function(key){
    if (key === 0) return true;

    return false;
  }

  $scope.background = function (object){
    console.log('BACKGROUND')

    return "http://placehold.it/1900x1080&text=Slide One";
  }

  function getLocation(filename){
    console.log(filename);

    return [ 'tmp-imgs/', filename , '.jpg'].join('');
  }



}
