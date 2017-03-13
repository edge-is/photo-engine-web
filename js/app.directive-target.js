
function directiveTarget(){
  return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var target = attrs.poeTarget;

        var targets = ['_self', '_blank'];

        if (targets.indexOf(target) === -1 ){
          target = false;
        }
        
        if (target){
          return element.attr("target", target);
        }

      }
  };
}
