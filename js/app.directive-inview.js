
search.directive('inView', ['$window', directiveInView]);

function directiveInView($window){
  return {
    restrict : 'A',
    link : function ($scope, element, attrs, ngModel){

      var offset = attrs['inViewOffset'];

      var count = attrs['inViewCount'];

      var id = attrs['id'];

      var trigger = function (){};

      var fnName= attrs['inView'];

      var fn = $scope.$parent[fnName];
      if (typeof fn === 'function'){
        trigger = fn;
      }else{
        return;
      }

      var loading = false;
      if (isEven(count / offset )) {

        angular.element($window).bind('scroll', function (){
          if (loading) return;
          loading = true;
          setTimeout(function (){
            if (isInView(element)){
              trigger(id, element);
            }
            loading = false;
          }, 1000);
        });
      }

      function isEven(n) {
         return n % 2 == 0;
      }

      function isInView(element){
        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height();

        var elemTop = $(element).offset().top;
        var elemBottom = elemTop + $(element).height();

        return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
        if (wS > (hT+hH-wH)){
          return true;
        }
      }
    }
  }
}
