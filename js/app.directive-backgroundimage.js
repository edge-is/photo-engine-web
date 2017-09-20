/**
 * Directive to create a background image
 */

function directiveBackgroundImage(cdn){
  return {
    restrict : 'ACE',
    link : function(scope, element, attrs){
      var url = [ 'url(', attrs.backgroundImage, ')'].join('');
      element.css({
          'background-image': url
      });
    }
  };
}
