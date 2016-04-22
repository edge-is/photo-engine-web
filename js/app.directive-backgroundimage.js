search.directive('backgroundImage', [directiveBackgroundImage]);


function directiveBackgroundImage(){
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
