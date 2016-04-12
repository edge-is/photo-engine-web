search.directive('lazyimg', function (){
  return {
    restrict: 'ACE',
    template : function (element, attr){
      return '<img class="low-resolution-image" ng-src="' + attr.lowres + '"></img><img class="hidden high-resolution-image" ng-src="' + attr.highres + '"></img>';
    },
    link : function (scope, element, attr){
      $('.high-resolution-image').bind('load', function (){

        $('.low-resolution-image').addClass('hidden');
        $('.high-resolution-image')
           .removeClass('hidden').unbind('load');
      });
    }
  };
});
