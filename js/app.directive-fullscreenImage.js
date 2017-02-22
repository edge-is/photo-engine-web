function directiveFullscreenImage(){
  return {
    restrict: 'ACE',
    scope : {
      image : "="
    },
    replace: true,
    template : function (element, attr){
      return '<img  ng-src="{{selectedImage}}"/>';
    },
    link : function ($scope, element, attr){

      var $item = $(element);
      var $wHeight = $(window).height();

      $item.height($wHeight - 60);

      $scope.selectedImage = selectImage($scope.image);

      function selectImage(image){
        var cdnImage = image._source._thumbnails['xx-large'].name;
        var cdn = "https://static.myndahlada.is/thumbnails/";

        return [cdn, cdnImage].join('');
      }

      /*$(window).on('resize', function (){
        $wHeight = $(window).height();
        $item.height($wHeight);
      });*/

    }
  };
}
