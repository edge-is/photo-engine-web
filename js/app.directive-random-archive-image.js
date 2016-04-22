search.directive('randomArchiveImage', ['$http','$compile',  directiveRandomArchiveImage] );

function directiveRandomArchiveImage($http, $compile){
  return {
    restrict : 'ACE',
    template : function (elem, attrs){
      return '<div class="carousel slide archives-carousel" data-ride="carousel"><div class="carousel-inner" role="listbox"><div class="item active"><div class="background-thumbnail"></div><div class="carousel-caption"><h5>{{archive_name}}</h5></div></div></div></div>';
      //return '<div class="background-thumbnail"></div>';

    },
    replace : true,
    link : function ($scope, element, attrs){
      $scope.availableImages=[];
      $scope.archive_name = attrs.archiveName;
      $scope.image_name = "";
      var url = [config.api, '/random/archives?archive_id=', attrs.archive  ].join('')
      $http.get(url).success(function (response){
        $scope.availableImages = response.data.hits;
        var selected = response.data.hits.pop();

        $scope.image_name = selected._id;
        $scope.selectedArchiveImage = selected._source.cdn1.small;
        element.attr('background-image', $scope.selectedArchiveImage);
        $compile(element)($scope);
      });
    },
  }
}
