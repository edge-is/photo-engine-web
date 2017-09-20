/**
 * Directive to lazy load images, creates trigger that fires when image is ready and then replaces;
 */

function directiveLazyImage($timeout, cdn){
  return {
    restrict: 'ACE',
    scope : {
      image : "="
    },
    template : function (element, attr){
      return [
      '<img class="low-resolution-image" ng-src="{{lowres}}"/>',
      '<img class="hidden high-resolution-image" ng-src="{{highres}}"/>'
      ].join('');
    },
    link : function ($scope, element, attr){
      // Select image for the device...
      //
      // FIXME: Dynamic image selection
      $scope.$watch('image', function (_new){
        if (!_new) return;

        $scope.lowres = cdn.thumbnail($scope.image._source, attr.lowres);
        $scope.highres = cdn.thumbnail($scope.image._source, attr.highres);
      })

      $('.high-resolution-image').bind('load', function (){
        $('.low-resolution-image').addClass('hidden');
        $scope.$apply();
        $timeout(function (){
          $('.high-resolution-image')
             .removeClass('hidden')
             .unbind('load');
        }, 10)
        $('.low-resolution-image').remove();
      });
    }
  };
}
