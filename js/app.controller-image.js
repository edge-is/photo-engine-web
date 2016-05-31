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
